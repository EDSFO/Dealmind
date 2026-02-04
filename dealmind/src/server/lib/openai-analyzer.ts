import OpenAI from "openai";
import { env } from "~/env";

// ============================================================================
// Types
// ============================================================================

export interface ConversationAnalysisInput {
  conversationId: string;
  tenantId: string;
  transcriptionText: string;
  dealId?: string;
  contactId?: string;
  subject?: string;
  conversationDate?: Date;
}

export interface N8NInsightData {
  interests?: string[];
  objections?: string[];
  commitments?: string[];
  progressSignals?: Array<{ signal: string; confidence: number }>;
  riskSignals?: Array<{ signal: string; severity: "low" | "medium" | "high" }>;
  nextActions?: string[];
  summary?: string;
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

export interface AnalysisResult {
  success: boolean;
  insights?: N8NInsightData;
  error?: string;
}

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `Você é um Consultor Comercial Sênior especializado em análise de vendas B2B. Sua função é analisar transcrições de reuniões comerciais e fornecer insights acionáveis para maximizar as chances de fechamento.

## REGRAS CRÍTICAS DE FORMATAÇÃO

1. **RESUMO EXECUTIVO**: Máximo 200 caracteres, seja conciso e direto
2. **LISTAS**: Use apenas itens curtos e objetivos (máximo 15 palavras cada)
3. **IDIOMA**: Todo o conteúdo DEVE estar em PORTUGUÊS BRASILEIRO
4. **JSON**: Retorne APENAS JSON válido, sem markdown, sem texto extra

## ESTRUTURA DE SAÍDA (JSON)

{
  "summary": "Frase curta resumindo a reunião em português",
  "interests": ["item1", "item2"],
  "objections": ["item1", "item2"],
  "commitments": ["item1", "item2"],
  "nextActions": ["item1", "item2"],
  "progressSignals": [{"signal": "descrição curta", "confidence": 0.0-1.0}],
  "riskSignals": [{"signal": "descrição curta", "severity": "low|medium|high"}],
  "confidence": 0.0-1.0,
  "recommendation": "ACELERAR|NUTRIR|REAVALIAR|DESQUALIFICAR"
}

## REGRAS

- NUNCA use listas com mais de 5 itens
- Cada item deve ter no máximo 15 palavras
- Não invente informações não mencionadas na transcrição
- Se não tiver informação, use array vazio []
- confidence é sua confiança geral na análise (0-1)
- recommendation deve ser uma das opções válidas`;

// ============================================================================
// OpenAI Client
// ============================================================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY || env.OPENAI_API_KEY,
      baseURL: env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }
  return openaiClient;
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze conversation transcription using OpenAI
 *
 * @param data - Conversation data to analyze
 * @returns Analysis result with insights
 */
export async function analyzeConversation(
  data: ConversationAnalysisInput
): Promise<AnalysisResult> {
  const {
    conversationId,
    tenantId,
    transcriptionText,
    dealId,
    contactId,
    subject,
    conversationDate,
  } = data;

  console.log(`[OpenAI Analyzer] Starting analysis for conversation: ${conversationId}`);

  try {
    const client = getOpenAIClient();

    const userPrompt = buildUserPrompt({
      transcriptionText,
      subject,
      conversationDate,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the structured analysis
    const parsedAnalysis = parseAnalysisResponse(content, transcriptionText);

    console.log(`[OpenAI Analyzer] Analysis complete for conversation: ${conversationId}`);

    return {
      success: true,
      insights: parsedAnalysis,
    };
  } catch (error) {
    console.error(`[OpenAI Analyzer] Error analyzing conversation ${conversationId}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build user prompt with conversation context
 */
function buildUserPrompt(params: {
  transcriptionText: string;
  subject?: string;
  conversationDate?: Date;
}): string {
  const { transcriptionText, subject, conversationDate } = params;

  let prompt = `## TRANSCRIÇÃO DA REUNIÃO\n\n${transcriptionText.trim()}`;

  if (subject) {
    prompt += `\n\n## TÓPICO DA REUNIÃO\n${subject}`;
  }

  if (conversationDate) {
    prompt += `\n\n## DATA DA REUNIÃO\n${conversationDate.toISOString()}`;
  }

  prompt += `\n\n## INSTRUÇÕES
Analise a transcrição acima seguindo todas as metodologias especificadas.
Retorne a análise completa em formato JSON estruturado com todas as seções solicitadas.`;

  return prompt;
}

/**
 * Clean and normalize text fields from AI response
 */
function cleanText(text: string | undefined): string | undefined {
  if (!text) return undefined;

  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Parse OpenAI response into structured insight data
 */
function parseAnalysisResponse(rawResponse: string, transcriptionText: string): N8NInsightData {
  try {
    // Clean the response first - remove any markdown formatting
    let cleanResponse = rawResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[a-zA-Z_]+\s*=/g, '')
      .trim();

    // Try to parse the cleaned JSON response
    const parsed = JSON.parse(cleanResponse);

    // Extract structured data from the response
    const interests: string[] = [];
    const objections: string[] = [];
    const commitments: string[] = [];
    const nextActions: string[] = [];
    const progressSignals: Array<{ signal: string; confidence: number }> = [];
    const riskSignals: Array<{ signal: string; severity: "low" | "medium" | "high" }> = [];

    // Parse interests from analysis
    if (parsed.informacoesCriticas?.doresProblemas) {
      interests.push(...parsed.informacoesCriticas.doresProblemas);
    }
    if (parsed.analisePorMetodologia) {
      Object.values(parsed.analisePorMetodologia as Record<string, any>).forEach((method: any) => {
        if (method?.gapsLacunas) {
          method.gapsLacunas.forEach((gap: string) => {
            if (!objections.includes(gap) && gap.length < 200) {
              objections.push(gap);
            }
          });
        }
      });
    }

    // Parse commitments
    if (parsed.riscosDaOportunidade?.medios) {
      parsed.riscosDaOportunidade.medios.forEach((risk: string) => {
        if (!objections.includes(risk) && risk.length < 200) {
          objections.push(risk);
        }
      });
    }

    // Parse next actions
    if (parsed.planoDeAcao) {
      if (parsed.planoDeAcao.acoesImediatas) {
        parsed.planoDeAcao.acoesImediatas.forEach((action: any) => {
          const actionText = typeof action === "string" ? action : action.acao || action.objetivo;
          if (actionText && !nextActions.includes(actionText)) {
            nextActions.push(actionText);
          }
        });
      }
      if (parsed.planoDeAcao.acaoDeCurtoPrazo) {
        parsed.planoDeAcao.acaoDeCurtoPrazo.forEach((action: any) => {
          const actionText = typeof action === "string" ? action : action.acao || action.objetivo;
          if (actionText && !nextActions.includes(actionText)) {
            nextActions.push(actionText);
          }
        });
      }
    }

    // Parse progress signals from score
    if (parsed.scoreGeralDaOportunidade) {
      const score = parsed.scoreGeralDaOportunidade;
      progressSignals.push({
        signal: `Probabilidade de fechamento: ${score.probabilidadeFechamento || "N/A"}`,
        confidence: parseConfidenceScore(score.probabilidadeFechamento),
      });
      progressSignals.push({
        signal: `Recomendação: ${score.recomendacao || "N/A"}`,
        confidence: 0.8,
      });
    }

    // Parse risk signals
    if (parsed.riscosDaOportunidade) {
      if (parsed.riscosDaOportunidade.altos) {
        parsed.riscosDaOportunidade.altos.forEach((risk: string) => {
          riskSignals.push({ signal: risk, severity: "high" });
        });
      }
      if (parsed.riscosDaOportunidade.medios) {
        parsed.riscosDaOportunidade.medios.forEach((risk: string) => {
          riskSignals.push({ signal: risk, severity: "medium" });
        });
      }
      if (parsed.riscosDaOportunidade.baixos) {
        parsed.riscosDaOportunidade.baixos.forEach((risk: string) => {
          riskSignals.push({ signal: risk, severity: "low" });
        });
      }
    }

    // Generate summary from ejecutivo
    const summary = parsed.resumoExecutivo || generateSummaryFromAnalysis(parsed);

    // Extract company/contact/deal info if mentioned
    const extractedData = extractEntitiesFromText(transcriptionText);

    return {
      interests: interests.length > 0 ? interests : undefined,
      objections: objections.length > 0 ? objections : undefined,
      commitments: commitments.length > 0 ? commitments : undefined,
      progressSignals: progressSignals.length > 0 ? progressSignals : undefined,
      riskSignals: riskSignals.length > 0 ? riskSignals : undefined,
      nextActions: nextActions.length > 0 ? nextActions : undefined,
      summary,
      extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
    };
  } catch (error) {
    console.error("[OpenAI Analyzer] Failed to parse response:", error);

    // Return basic structure with raw text as summary
    return {
      summary: rawResponse.substring(0, 1000),
    };
  }
}

/**
 * Generate summary from analysis sections
 */
function generateSummaryFromAnalysis(parsed: any): string {
  const parts: string[] = [];

  if (parsed.resumoExecutivo) {
    parts.push(parsed.resumoExecutivo);
  }

  if (parsed.scoreGeralDaOportunidade?.recomendacao) {
    parts.push(`Recomendação: ${parsed.scoreGeralDaOportunidade.recomendacao}`);
  }

  return parts.join(" | ");
}

/**
 * Parse percentage string to confidence number
 */
function parseConfidenceScore(percentageStr?: string): number {
  if (!percentageStr) return 0.5;

  const match = String(percentageStr).match(/(\d+)/);
  if (match) {
    return Math.min(1, Math.max(0, parseInt(match[1]) / 100));
  }
  return 0.5;
}

/**
 * Simple entity extraction from transcription text
 */
function extractEntitiesFromText(text: string): N8NInsightData["extractedData"] {
  const result: N8NInsightData["extractedData"] = {
    extractedAt: new Date().toISOString(),
    completeness: "partial",
    confidence: 0.3, // Low confidence for auto-extraction
    missingFields: [],
  };

  // Simple email extraction
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
  const emails = text.match(emailRegex);

  if (emails && emails.length > 0) {
    result.contact = {
      email: emails[0],
    };
  }

  // Simple phone extraction (Brazilian format)
  const phoneRegex = /(\+55)?\s?(\d{2})\s?(\d{4,5})-?(\d{4})/g;
  const phones = text.match(phoneRegex);

  if (phones && phones.length > 0) {
    if (!result.contact) result.contact = {};
    result.contact.whatsapp = phones[0];
  }

  // Check if we found any data
  const hasData = (result.contact && Object.keys(result.contact).some(k => result.contact?.[k])) ||
                  (result.company && Object.keys(result.company).some(k => result.company?.[k]));

  if (!hasData) {
    return undefined;
  }

  return result;
}

export { getOpenAIClient };
