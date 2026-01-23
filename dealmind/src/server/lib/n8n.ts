import { createHmac, timingSafeEqual } from "crypto";
import { env } from "~/env";

// ============================================================================
// Types
// ============================================================================

export interface N8NWebhookPayload {
  conversation_id: string;
  tenant_id: string;
  transcription_text: string;
  deal_id?: string;
  contact_id?: string;
  subject?: string;
  conversation_date?: string;
  callback_url: string;
  timestamp: number;
}

export interface N8NCallbackPayload {
  conversation_id: string;
  tenant_id: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  insights?: N8NInsightData;
  error_reason?: string;
  timestamp: number;
}

export interface N8NInsightData {
  interests?: string[];
  objections?: string[];
  commitments?: string[];
  progressSignals?: Array<{ signal: string; confidence: number }>;
  riskSignals?: Array<{ signal: string; severity: "low" | "medium" | "high" }>;
  nextActions?: string[];
  summary?: string;
  // Dados extraídos da conversa para preenchimento automático do CRM
  extractedData?: {
    extractedAt?: string;
    completeness?: "partial" | "complete";
    confidence?: number;
    missingFields?: string[];
    company?: {
      name?: string | null;
      legalName?: string | null;
      cnpj?: string | null;
      website?: string | null;
      segment?: string | null;
      businessType?: "B2B" | "B2C" | "INDUSTRY" | "RETAIL" | "SERVICES" | "TECHNOLOGY" | "MANUFACTURING" | "AGRO" | "OTHER" | null;
      companySize?: "MICRO" | "SMALL" | "MEDIUM" | "LARGE" | null;
      employeeCount?: number | null;
      annualRevenue?: number | null;
      country?: string | null;
      state?: string | null;
      city?: string | null;
      potential?: "LOW" | "MEDIUM" | "HIGH" | null;
      leadSource?: "INBOUND" | "OUTBOUND" | "REFERRAL" | "EVENT" | "PARTNERSHIP" | "ADVERTISING" | "CONTENT" | "SOCIAL_MEDIA" | "OTHER" | null;
    };
    contact?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      landline?: string | null;
      mobilePhone?: string | null;
      whatsapp?: string | null;
      position?: string | null;
      department?: string | null;
      linkedinUrl?: string | null;
    };
    deal?: {
      title?: string | null;
      value?: number | null;
      currency?: string | null;
      expectedClose?: string | null;
      clientProblem?: string | null;
      opportunityReason?: string | null;
      sourceChannel?: "INBOUND" | "OUTBOUND" | "REFERRAL" | "PARTNER" | "EVENT" | "ADVERTISING" | "CONTENT" | "SOCIAL_MEDIA" | "WEBSITE" | "EMAIL_MARKETING" | "OTHER" | null;
      marketSegment?: string | null;
      productSolution?: string | null;
      quantity?: number | null;
    };
    participants?: Array<{
      name: string;
      role?: string;
      email?: string | null;
      phone?: string | null;
    }>;
  };
}

// ============================================================================
// Constants
// ============================================================================

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// HMAC Signature Functions
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for payload
 */
function generateSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Verify HMAC-SHA256 signature from request
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);

  // Convert to buffers with same length for timingSafeEqual
  const signatureBuf = Buffer.from(signature, "utf-8");
  const expectedBuf = Buffer.from(expectedSignature, "utf-8");

  if (signatureBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(signatureBuf, expectedBuf);
}

/**
 * Verify timestamp is within acceptable window to prevent replay attacks
 */
export function verifyTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  return diff <= TIMESTAMP_TOLERANCE_MS;
}

// ============================================================================
// N8N Webhook Functions
// ============================================================================

/**
 * Send conversation data to N8N for AI processing
 *
 * @param data - Conversation data to send
 * @throws Error if webhook fails or returns non-OK status
 */
export async function sendToN8N(data: {
  conversationId: string;
  tenantId: string;
  transcriptionText: string;
  dealId?: string;
  contactId?: string;
  subject?: string;
  conversationDate?: Date;
}): Promise<void> {
  const {
    conversationId,
    tenantId,
    transcriptionText,
    dealId,
    contactId,
    subject,
    conversationDate,
  } = data;

  // Build webhook URL with callback endpoint
  const callbackUrl = `${getBaseUrl()}/api/webhooks/n8n-callback`;

  const payload: N8NWebhookPayload = {
    conversation_id: conversationId,
    tenant_id: tenantId,
    transcription_text: transcriptionText,
    deal_id: dealId,
    contact_id: contactId,
    subject,
    conversation_date: conversationDate?.toISOString(),
    callback_url: callbackUrl,
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, env.N8N_WEBHOOK_SECRET);

  console.log("[N8N] Sending webhook for conversation:", conversationId);

  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": String(payload.timestamp),
      },
      body: payloadString,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `N8N webhook returned ${response.status}: ${errorText}`
      );
    }

    console.log("[N8N] Webhook sent successfully for conversation:", conversationId);
  } catch (error) {
    console.error("[N8N] Failed to send webhook:", error);
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get base URL for callbacks
 * Detects from environment or uses localhost in development
 */
function getBaseUrl(): string {
  if (env.NODE_ENV === "production") {
    // In production, should be set via environment variable
    return process.env.NEXT_PUBLIC_APP_URL || "https://app.dealmind.com.br";
  }

  // In development, use localhost
  return "http://localhost:3000";
}

/**
 * Validate N8N callback payload structure
 */
export function isValidCallbackPayload(
  data: unknown
): data is N8NCallbackPayload {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const payload = data as Record<string, unknown>;

  return (
    typeof payload.conversation_id === "string" &&
    typeof payload.tenant_id === "string" &&
    typeof payload.status === "string" &&
    ["PROCESSING", "COMPLETED", "FAILED"].includes(payload.status) &&
    typeof payload.timestamp === "number"
  );
}
