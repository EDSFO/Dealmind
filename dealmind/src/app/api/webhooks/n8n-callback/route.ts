import { NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  verifySignature,
  verifyTimestamp,
  isValidCallbackPayload,
  type N8NCallbackPayload,
  type N8NInsightData,
} from "~/server/lib/n8n";
import { env } from "~/env";
import { processExtractedData } from "~/server/lib/crm-extractor";

/**
 * Validate if insights contain meaningful data
 * Returns true if at least one field has valid data
 */
function hasValidInsights(insights: N8NInsightData | undefined | null): boolean {
  if (!insights) {
    return false;
  }

  // Check if at least one array field has items
  const hasArrayData =
    (Array.isArray(insights.interests) && insights.interests.length > 0) ||
    (Array.isArray(insights.objections) && insights.objections.length > 0) ||
    (Array.isArray(insights.commitments) && insights.commitments.length > 0) ||
    (Array.isArray(insights.nextActions) && insights.nextActions.length > 0) ||
    (Array.isArray(insights.progressSignals) && insights.progressSignals.length > 0) ||
    (Array.isArray(insights.riskSignals) && insights.riskSignals.length > 0);

  // Check if summary has content
  const hasSummary =
    typeof insights.summary === "string" && insights.summary.trim().length > 0;

  // Check if extractedData has any meaningful data
  const hasExtractedData =
    insights.extractedData &&
    typeof insights.extractedData === "object" &&
    Object.keys(insights.extractedData).length > 0 &&
    (
      (insights.extractedData.company && Object.keys(insights.extractedData.company).length > 0) ||
      (insights.extractedData.contact && Object.keys(insights.extractedData.contact).length > 0) ||
      (insights.extractedData.deal && Object.keys(insights.extractedData.deal).length > 0) ||
      (Array.isArray(insights.extractedData.participants) && insights.extractedData.participants.length > 0)
    );

  return hasArrayData || hasSummary || hasExtractedData;
}

/**
 * N8N Callback Webhook
 *
 * Receives processing results from N8N workflow:
 * - Updates conversation status (PROCESSING, COMPLETED, FAILED)
 * - Creates/updates Insight record with AI analysis
 *
 * Security: HMAC-SHA256 signature verification
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  // Get signature headers
  const signature = request.headers.get("x-webhook-signature");
  const timestampHeader = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestampHeader) {
    console.error("[N8N Callback] Missing signature headers");
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 401 }
    );
  }

  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as unknown;

    // Verify signature
    if (!verifySignature(rawBody, signature, env.N8N_WEBHOOK_SECRET)) {
      console.error("[N8N Callback] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Validate payload structure
    if (!isValidCallbackPayload(payload)) {
      console.error("[N8N Callback] Invalid payload structure:", payload);
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 }
      );
    }

    // Verify timestamp (replay attack prevention)
    if (!verifyTimestamp(payload.timestamp)) {
      console.error("[N8N Callback] Timestamp outside valid window");
      return NextResponse.json(
        { error: "Timestamp expired" },
        { status: 401 }
      );
    }

    const {
      conversation_id,
      tenant_id,
      status,
      insights,
      error_reason,
    } = payload;

    // Verify conversation exists and belongs to tenant
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversation_id,
        tenantId: tenant_id,
      },
    });

    if (!conversation) {
      console.error(
        "[N8N Callback] Conversation not found or tenant mismatch:",
        conversation_id
      );
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Update conversation status based on callback status
    let processingStatus: "PROCESSING" | "COMPLETED" | "FAILED" = "PENDING";

    switch (status) {
      case "PROCESSING":
        processingStatus = "PROCESSING";
        await db.conversation.update({
          where: { id: conversation_id },
          data: { processingStatus },
        });
        console.log("[N8N Callback] Updated status to PROCESSING:", conversation_id);
        break;

      case "COMPLETED":
        // Validate that insights are present and contain meaningful data
        if (!hasValidInsights(insights)) {
          // If status is COMPLETED but insights are empty/invalid, treat as FAILED
          processingStatus = "FAILED";
          await db.conversation.update({
            where: { id: conversation_id },
            data: {
              processingStatus,
              errorReason: "N8N retornou status COMPLETED mas sem insights válidos (output vazio ou inválido)",
            },
          });
          console.error(
            "[N8N Callback] COMPLETED status with empty/invalid insights, marked as FAILED:",
            conversation_id,
            "Insights received:",
            JSON.stringify(insights)
          );
          break;
        }

        processingStatus = "COMPLETED";
        // Create or update insight
        await db.insight.upsert({
          where: { conversationId: conversation_id },
          create: {
            conversationId: conversation_id,
            interests: insights.interests || [],
            objections: insights.objections || [],
            commitments: insights.commitments || [],
            progressSignals: insights.progressSignals || [],
            riskSignals: insights.riskSignals || [],
            nextActions: insights.nextActions || [],
            summary: insights.summary,
            extractedData: insights.extractedData || null,
          },
          update: {
            interests: insights.interests || [],
            objections: insights.objections || [],
            commitments: insights.commitments || [],
            progressSignals: insights.progressSignals || [],
            riskSignals: insights.riskSignals || [],
            nextActions: insights.nextActions || [],
            summary: insights.summary,
            extractedData: insights.extractedData || null,
          },
        });

        // Process extracted data to create/update CRM records
        if (insights.extractedData) {
          const crmResult = await processExtractedData(
            db,
            tenant_id,
            conversation.userId,
            conversation_id,
            insights.extractedData
          );

          if (crmResult.success) {
            console.log(
              "[N8N Callback] CRM records updated:",
              JSON.stringify(crmResult)
            );
          } else {
            console.log(
              "[N8N Callback] CRM update skipped:",
              crmResult.message,
              `(${crmResult.skippedReason})`
            );
          }
        }

        await db.conversation.update({
          where: { id: conversation_id },
          data: { processingStatus },
        });
        console.log("[N8N Callback] Completed and created insight:", conversation_id);
        break;

      case "FAILED":
        processingStatus = "FAILED";
        await db.conversation.update({
          where: { id: conversation_id },
          data: {
            processingStatus,
            errorReason: error_reason || "Unknown error from N8N",
          },
        });
        console.error(
          "[N8N Callback] Failed processing:",
          conversation_id,
          error_reason
        );
        break;
    }

    const duration = Date.now() - startTime;
    console.log(
      `[N8N Callback] Processed in ${duration}ms - ${conversation_id} -> ${status}`
    );

    return NextResponse.json({
      success: true,
      conversation_id,
      status: processingStatus,
    });

  } catch (error) {
    console.error("[N8N Callback] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Signature, X-Webhook-Timestamp",
    },
  });
}
