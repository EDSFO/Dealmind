import { PrismaClient } from "../../../generated/prisma";

/**
 * Process extracted data from conversation and create/update CRM records
 *
 * Rules:
 * - ONLY create/update records if minimum data is available
 * - Be conservative - partial data stays in extractedData only
 * - Populate all available fields from extractedData
 */

export interface ExtractedData {
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
  confidence?: number;
  missingFields?: string[];
}

export interface CRMUpdateResult {
  success: boolean;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  message: string;
  skippedReason?: string;
}

/**
 * Process extracted data and update CRM records
 */
export async function processExtractedData(
  db: PrismaClient,
  tenantId: string,
  userId: string,
  conversationId: string,
  extractedData: ExtractedData | null | undefined
): Promise<CRMUpdateResult> {
  // No extracted data or low confidence - skip
  if (!extractedData) {
    return {
      success: false,
      message: "No extracted data provided",
      skippedReason: "no_data",
    };
  }

  const confidence = extractedData.confidence || 0;

  // Low confidence - skip CRM updates
  if (confidence < 0.5) {
    return {
      success: false,
      message: `Low confidence (${confidence}), skipping CRM updates`,
      skippedReason: "low_confidence",
    };
  }

  const { company, contact, deal } = extractedData;
  const companyData = company ?? {};
  const dealData = deal ?? {};

  // MINIMUM REQUIREMENTS: Need company name OR contact firstName
  const hasCompanyName = company?.name && company.name.trim().length > 0;
  const hasContactName = contact?.firstName && contact.firstName.trim().length > 0;

  if (!hasCompanyName && !hasContactName) {
    return {
      success: false,
      message: "Missing minimum data (company name or contact name)",
      skippedReason: "insufficient_data",
    };
  }

  try {
    let companyId: string | undefined;
    let contactId: string | undefined;
    let dealId: string | undefined;

    // 1. Create/Find Company
    if (hasCompanyName) {
      // Try to find by CNPJ first (more unique)
      let existingCompany = null;

      if (company.cnpj) {
        existingCompany = await db.company.findUnique({
          where: { cnpj: company.cnpj },
        });
      }

      // If not found by CNPJ, try by name (case-insensitive)
      if (!existingCompany && company.name) {
        existingCompany = await db.company.findFirst({
          where: {
            tenantId,
            name: {
              mode: "insensitive",
              equals: company.name,
            },
          },
        });
      }

      if (existingCompany) {
        companyId = existingCompany.id;

        // Update company with new data if available
        const updateData: any = {};
        if (company.legalName && !existingCompany.legalName) updateData.legalName = company.legalName;
        if (company.website && !existingCompany.website) updateData.website = company.website;
        if (company.segment && !existingCompany.segment) updateData.segment = company.segment;
        if (company.businessType && !existingCompany.businessType) updateData.businessType = company.businessType;
        if (company.companySize && !existingCompany.companySize) updateData.companySize = company.companySize;
        if (company.employeeCount && !existingCompany.employeeCount) updateData.employeeCount = company.employeeCount;
        if (company.annualRevenue && !existingCompany.annualRevenue) updateData.annualRevenue = String(company.annualRevenue);
        if (company.country && !existingCompany.country) updateData.country = company.country;
        if (company.state && !existingCompany.state) updateData.state = company.state;
        if (company.city && !existingCompany.city) updateData.city = company.city;
        if (company.potential && !existingCompany.potential) updateData.potential = company.potential;
        if (company.leadSource && !existingCompany.leadSource) updateData.leadSource = company.leadSource;

        if (Object.keys(updateData).length > 0) {
          await db.company.update({
            where: { id: companyId },
            data: updateData,
          });
        }
      } else {
        // Create new company
        const newCompany = await db.company.create({
          data: {
            tenantId,
            name: company.name!,
            legalName: company.legalName || null,
            cnpj: company.cnpj || null,
            website: company.website || null,
            segment: company.segment || null,
            businessType: company.businessType || null,
            companySize: company.companySize || null,
            employeeCount: company.employeeCount || null,
            annualRevenue: company.annualRevenue ? String(company.annualRevenue) : null,
            country: company.country || "Brasil",
            state: company.state || null,
            city: company.city || null,
            potential: company.potential || null,
            leadSource: company.leadSource || null,
            status: "LEAD", // Default for companies created from conversations
          },
        });
        companyId = newCompany.id;
      }
    }

    // 2. Create/Find Contact
    if (hasContactName) {
      const contactEmail = contact?.email || null;
      const contactName = contact?.firstName || "";

      // Try to find by email first
      let existingContact = null;

      if (contactEmail) {
        existingContact = await db.contact.findFirst({
          where: {
            tenantId,
            email: contactEmail,
          },
        });
      }

      // If not found by email, try by firstName+lastName+company
      if (!existingContact && companyId) {
        existingContact = await db.contact.findFirst({
          where: {
            tenantId,
            firstName: contactName,
            lastName: contact?.lastName || null,
            companyId,
          },
        });
      }

      // If not found, try by firstName+lastName only
      if (!existingContact && contactName) {
        existingContact = await db.contact.findFirst({
          where: {
            tenantId,
            firstName: contactName,
            lastName: contact?.lastName || null,
          },
        });
      }

      if (existingContact) {
        contactId = existingContact.id;

        // Update contact with new data
        const updateData: any = {};
        if (contact.email && !existingContact.email) updateData.email = contact.email;
        if (contact.landline && !existingContact.landline) updateData.landline = contact.landline;
        if (contact.mobilePhone && !existingContact.mobilePhone) updateData.mobilePhone = contact.mobilePhone;
        if (contact.whatsapp && !existingContact.whatsapp) updateData.whatsapp = contact.whatsapp;
        if (contact.position && !existingContact.position) updateData.position = contact.position;
        if (contact.department && !existingContact.department) updateData.department = contact.department;
        if (contact.linkedinUrl && !existingContact.linkedinUrl) updateData.linkedinUrl = contact.linkedinUrl;
        if (companyId && !existingContact.companyId) updateData.companyId = companyId;
        if (companyId && !existingContact.company) updateData.company = companyData.name || null;

        if (Object.keys(updateData).length > 0) {
          await db.contact.update({
            where: { id: contactId },
            data: updateData,
          });

          // Update lastContactAt
          await db.contact.update({
            where: { id: contactId },
            data: { lastContactAt: new Date() },
          });
        }
      } else {
        // Create new contact
        const newContact = await db.contact.create({
          data: {
            tenantId,
            firstName: contactName,
            lastName: contact.lastName || null,
            email: contact.email || null,
            landline: contact.landline || null,
            mobilePhone: contact.mobilePhone || null,
            whatsapp: contact.whatsapp || null,
            position: contact.position || null,
            department: contact.department || null,
            linkedinUrl: contact.linkedinUrl || null,
            companyId: companyId || null,
            company: companyId ? companyData.name || null : null,
            source: "CONVERSATION", // Indicates this contact came from a conversation
            status: "LEAD",
            lastContactAt: new Date(),
          },
        });
        contactId = newContact.id;
      }
    }

    // 3. Create Deal if we have meaningful data
    const dealTitle =
      dealData.title || (hasCompanyName ? `Oportunidade - ${companyData.name}` : undefined);

    if (dealTitle && contactId) {
      // Get default pipeline stage for tenant
      const defaultStage = await db.pipelineStage.findFirst({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { order: "asc" },
      });

      if (!defaultStage) {
        return {
          success: false,
          message: "No default pipeline stage found for tenant",
          skippedReason: "no_pipeline_stage",
        };
      }

      // Check if deal already exists for this conversation
      const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        select: { dealId: true },
      });

      if (conversation?.dealId) {
        dealId = conversation.dealId;

        // Update existing deal with new data
        const dealUpdateData: any = {};
        if (dealData.value) dealUpdateData.value = dealData.value;
        if (dealData.currency) dealUpdateData.currency = dealData.currency;
        if (dealData.expectedClose) {
          dealUpdateData.expectedClose = new Date(dealData.expectedClose);
        }
        if (dealData.clientProblem) dealUpdateData.clientProblem = dealData.clientProblem;
        if (dealData.opportunityReason) dealUpdateData.opportunityReason = dealData.opportunityReason;
        if (dealData.sourceChannel) dealUpdateData.sourceChannel = dealData.sourceChannel;
        if (dealData.marketSegment) dealUpdateData.marketSegment = dealData.marketSegment;
        if (dealData.productSolution) dealUpdateData.productSolution = dealData.productSolution;
        if (dealData.quantity !== undefined) dealUpdateData.quantity = dealData.quantity;
        if (companyId && !dealUpdateData.companyId) dealUpdateData.companyId = companyId;

        if (Object.keys(dealUpdateData).length > 0) {
          await db.deal.update({
            where: { id: dealId },
            data: dealUpdateData,
          });
        }
      } else {
        // Create new deal
        const newDeal = await db.deal.create({
          data: {
            tenantId,
            ownerId: userId,
            contactId,
            title: dealTitle,
            value: dealData.value ? String(dealData.value) : "0",
            currency: dealData.currency || "BRL",
            stageId: defaultStage.id,
            probability: defaultStage.probability || 0,
            clientProblem: dealData.clientProblem || null,
            opportunityReason: dealData.opportunityReason || null,
            sourceChannel: dealData.sourceChannel || null,
            marketSegment: dealData.marketSegment || null,
            productSolution: dealData.productSolution || null,
            quantity: dealData.quantity || null,
            ...(dealData.expectedClose && {
              expectedClose: new Date(dealData.expectedClose),
            }),
            ...(companyId && { companyId }),
          },
        });
        dealId = newDeal.id;

        // Link deal to conversation
        await db.conversation.update({
          where: { id: conversationId },
          data: { dealId },
        });
      }
    }

    return {
      success: true,
      companyId,
      contactId,
      dealId,
      message: "CRM records updated successfully",
    };
  } catch (error) {
    console.error("[CRM Extractor] Error processing extracted data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      skippedReason: "error",
    };
  }
}
