import { z } from 'zod'

/**
 * SOURCE SCHEMAS
 *
 * These schemas represent the EXACT structure scraped from the source website
 * WITHOUT any processing, transformation, or enrichment.
 *
 * The data should be stored exactly as extracted from the HTML/API.
 *
 * Guidelines:
 * - Use the exact field names from the source (or descriptive names)
 * - Store dates as strings in their original format
 * - Don't normalize or clean data at this stage
 * - Include all available fields, even if optional
 * - Use .nullable().optional() for fields that might not exist
 */

/**
 * SOURCE_DOCUMENT
 *
 * Represents a single document/attachment from the Pennsylvania eMarketplace.
 */
export const SOURCE_DOCUMENT = z.object({
    id: z.string(),
    contractId: z.string(),
    title: z.string(),
    fileName: z.string(),
    downloadUrl: z.string(),
    localPath: z.string(),
    fileType: z.string().nullable().optional(),
    fileSize: z.number().nullable().optional(),
})

/**
 * SOURCE_CONTRACT
 *
 * Represents a single contract from Pennsylvania eMarketplace.
 */
export const SOURCE_CONTRACT = z.object({
    id: z.string(),
    title: z.string().nullable().optional(),
    parent: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    reasonForChange: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    beginDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    execDate: z.string().nullable().optional(),
    contractAmount: z.string().nullable().optional(),
    supplierName: z.string().nullable().optional(),
    supplierNumber: z.string().nullable().optional(),
    commoditySpecialist: z.string().nullable().optional(),
    agency: z.string().nullable().optional(),
    lastUpdated: z.string().nullable().optional(),
    costars: z.string().nullable().optional(),
    pcard: z.string().nullable().optional(),
    tabs: z.string().nullable().optional(),
    solicitations: z.string().nullable().optional(),
    awards: z.string().nullable().optional(),
    mscc: z.boolean().nullable().optional(),
})

/**
 * SOURCE_LISTING
 *
 * Represents a listing contract item from Pennsylvania eMarketplace.
 */
export const SOURCE_LISTING = z.object({
    id: z.string(),
    url: z.string(),
    title: z.string(),
})

/**
 * SOURCE_OPPORTUNITY
 *
 * Represents a full opportunity from Pennsylvania eMarketplace.
 */
export const SOURCE_OPPORTUNITY = z.object({
    id: z.string(),
    url: z.string(),
    contract: SOURCE_CONTRACT,
    documents: z.array(SOURCE_DOCUMENT),
})

/**
 * SOURCE_TO_INTAKE
 *
 * Container for a complete scraping session's data.
 */
export const SOURCE_TO_INTAKE = z.object({
    metadata: z.object({
        source: z.string(),
        sourceUrl: z.string(),
        dateRange: z.object({
            from: z.string(),
            to: z.string(),
        }).nullable().optional(),
        pageRange: z.object({
            from: z.number(),
            to: z.number(),
        }).nullable().optional(),
        totalItems: z.number(),
        scrapedAt: z.string(),
    }),
    items: z.array(SOURCE_OPPORTUNITY),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SOURCE_LISTING = z.infer<typeof SOURCE_LISTING>
export type SOURCE_DOCUMENT = z.infer<typeof SOURCE_DOCUMENT>
export type SOURCE_CONTRACT = z.infer<typeof SOURCE_CONTRACT>
export type SOURCE_OPPORTUNITY = z.infer<typeof SOURCE_OPPORTUNITY>
export type SOURCE_TO_INTAKE = z.infer<typeof SOURCE_TO_INTAKE>
