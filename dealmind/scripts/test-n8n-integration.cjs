/**
 * Test Script for N8N Integration
 *
 * This script tests the complete N8N integration flow:
 * 1. Creates a test conversation
 * 2. Sends it to N8N webhook
 * 3. Simulates N8N callback with insights
 *
 * Usage:
 *   node dealmind/scripts/test-n8n-integration.cjs
 *
 * Prerequisites:
 *   - N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET in .env
 *   - Valid database connection
 *   - At least one user in the database
 */

require('dotenv').config();
const { PrismaClient } = require('../generated/prisma/index.js');
const { createHmac } = require('crypto');

const prisma = new PrismaClient();

// ============================================================================
// Configuration
// ============================================================================

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/api/webhooks/n8n-callback';

// ============================================================================
// Test Data
// ============================================================================

const TEST_CONVERSATION = {
  subject: 'N8N Integration Test',
  transcriptionText: `
    João: Olá, gostaria de saber mais sobre o plano Enterprise da sua solução.
    Maria: Claro! O plano Enterprise inclui todos os recursos do Pro, além de suporte dedicado 24/7, SLA de 99.9% e um gerente de conta dedicado.
    João: Qual é o investimento mensal?
    Maria: O plano Enterprise parte de R$ 2.000/mês, mas podemos personalizar conforme sua necessidade.
    João: Interessante. Vou discutir com minha equipe e retorno até terça-feira.
    Maria: Perfeito! Na terça-feira agendo uma apresentação técnica com nossa equipe.
  `,
  participants: ['João (Cliente)', 'Maria (Vendedor)'],
};

const TEST_INSIGHTS = {
  interests: [
    'Plano Enterprise',
    'Suporte dedicado 24/7',
    'SLA de 99.9%',
  ],
  objections: [
    'Preço - precisa validar com a equipe',
  ],
  commitments: [
    'Retorno até terça-feira',
  ],
  progressSignals: [
    { signal: 'Cliente perguntou sobre investimento', confidence: 0.8 },
    { signal: 'Cliente mencionou apresentação técnica', confidence: 0.9 },
  ],
  riskSignals: [
    { signal: 'Precisa validar com equipe', severity: 'low' },
  ],
  nextActions: [
    'Agendar apresentação técnica para terça-feira',
    'Enviar proposta formal Enterprise',
  ],
  summary: 'O cliente demonstrou interesse no plano Enterprise, questionando especificamente sobre suporte 24/7 e SLA. Houve objeção relacionada ao preço, mas cliente comprometeu-se a retornar até terça-feira após discussão com a equipe.',
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateSignature(payload, secret) {
  return createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Test Functions
// ============================================================================

async function createTestConversation(userId, tenantId) {
  console.log('\n📝 Creating test conversation...');

  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      userId,
      subject: TEST_CONVERSATION.subject,
      source: 'MANUAL',
      transcriptionText: TEST_CONVERSATION.transcriptionText,
      participants: TEST_CONVERSATION.participants,
      conversationDate: new Date(),
      processingStatus: 'PENDING',
    },
  });

  console.log('✅ Conversation created:');
  console.log('   ID:', conversation.id);
  console.log('   Subject:', conversation.subject);
  console.log('   Status:', conversation.processingStatus);

  return conversation;
}

async function sendToN8N(conversation) {
  console.log('\n🚀 Sending webhook to N8N...');

  const payload = {
    conversation_id: conversation.id,
    tenant_id: conversation.tenantId,
    transcription_text: conversation.transcriptionText,
    subject: conversation.subject,
    callback_url: CALLBACK_URL,
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, N8N_WEBHOOK_SECRET);

  console.log('   Webhook URL:', N8N_WEBHOOK_URL);
  console.log('   Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': String(payload.timestamp),
      },
      body: payloadString,
    });

    console.log('   Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', errorText);
      return false;
    }

    const responseText = await response.text();
    console.log('   Response:', responseText || '(empty)');
    console.log('✅ Webhook sent successfully!');
    return true;

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    return false;
  }
}

async function simulateCallback(conversation) {
  console.log('\n🔄 Simulating N8N callback...');

  const payload = {
    conversation_id: conversation.id,
    tenant_id: conversation.tenantId,
    status: 'COMPLETED',
    insights: TEST_INSIGHTS,
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, N8N_WEBHOOK_SECRET);

  console.log('   Callback URL:', CALLBACK_URL);
  console.log('   Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': String(payload.timestamp),
      },
      body: payloadString,
    });

    console.log('   Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Callback failed:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('   Response:', JSON.stringify(result, null, 2));
    console.log('✅ Callback successful!');
    return true;

  } catch (error) {
    console.error('❌ Callback error:', error.message);
    return false;
  }
}

async function verifyResults(conversationId) {
  console.log('\n🔍 Verifying results in database...');

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { insight: true },
  });

  if (!conversation) {
    console.log('❌ Conversation not found!');
    return false;
  }

  console.log('✅ Conversation found:');
  console.log('   Status:', conversation.processingStatus);

  if (conversation.insight) {
    console.log('✅ Insight created:');
    console.log('   Summary:', conversation.insight.summary?.substring(0, 100) + '...');
    console.log('   Interests:', conversation.insight.interests);
    console.log('   Next Actions:', conversation.insight.nextActions);
  } else {
    console.log('❌ No insight found!');
    return false;
  }

  return conversation.processingStatus === 'COMPLETED' && conversation.insight !== null;
}

// ============================================================================
// Main Test Flow
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     N8N Integration Test Script                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Validate environment
  if (!N8N_WEBHOOK_URL) {
    console.error('\n❌ N8N_WEBHOOK_URL not set in environment');
    console.log('   Set it in your .env file or run: export N8N_WEBHOOK_URL="..."');
    await prisma.$disconnect();
    return;
  }

  if (!N8N_WEBHOOK_SECRET) {
    console.error('\n❌ N8N_WEBHOOK_SECRET not set in environment');
    console.log('   Set it in your .env file or run: export N8N_WEBHOOK_SECRET="..."');
    await prisma.$disconnect();
    return;
  }

  // Get first user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('\n❌ No user found in database');
    await prisma.$disconnect();
    return;
  }

  console.log('\n✅ Test user found:', user.email);
  console.log('   Tenant ID:', user.tenantId);

  // Run test flow
  try {
    // 1. Create conversation
    const conversation = await createTestConversation(user.id, user.tenantId);

    // 2. Send to N8N
    const webhookSent = await sendToN8N(conversation);
    if (!webhookSent) {
      console.log('\n⚠️  Webhook failed. Check if N8N is running and accessible.');
      console.log('   Continuing with callback simulation...');
    }

    // 3. Wait a bit (simulating N8N processing)
    console.log('\n⏳ Waiting 2 seconds (simulating N8N processing)...');
    await sleep(2000);

    // 4. Simulate callback
    const callbackSuccess = await simulateCallback(conversation);
    if (!callbackSuccess) {
      console.log('\n❌ Callback failed!');
      await prisma.$disconnect();
      return;
    }

    // 5. Wait a bit for database update
    await sleep(500);

    // 6. Verify results
    const success = await verifyResults(conversation.id);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    if (success) {
      console.log('║     ✅ TEST PASSED! Integration is working             ║');
    } else {
      console.log('║     ❌ TEST FAILED! Check logs above                   ║');
    }
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
