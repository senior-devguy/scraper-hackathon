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
 * Represents a single document/attachment from the source.
 *
 * TODO: Define your document schema
 *
 * Example fields to include:
 * - id: string (generated)
 * - fileName: string (e.g., "RFP_Document.pdf")
 * - attachmentId: string (from source, if available)
 * - downloadUrl: string (local file path or URL after download)
 * - fileSize: number (in bytes)
 * - createdAt: string (ISO timestamp)
 * - contractId: string (link to parent opportunity)
 *
 * Add any source-specific fields you need.
 */
export const SOURCE_DOCUMENT = z.object({
    // TODO: Define document schema fields
    // Example:
    // id: z.string(),
    // fileName: z.string(),
    // downloadUrl: z.string(),
    // fileSize: z.number().nullable().optional(),
    // ... add more fields
})

/**
 * SOURCE_OPPORTUNITY
 *
 * Represents a single procurement opportunity from the source.
 * This is the main entity being scraped.
 *
 * TODO: Define your opportunity schema
 *
 * Example fields to include:
 * - id: string (generated)
 * - eventId: string (unique ID from source)
 * - title: string (opportunity title)
 * - description: string (full description)
 * - startDate: string (posting/start date as string)
 * - endDate: string (closing/end date as string)
 * - agencyName: string (issuing agency)
 * - agencyCode: string (agency identifier)
 * - status: string (e.g., "Open", "Closed")
 * - contactName: string (buyer/contact name)
 * - contactEmail: string (buyer email)
 * - contactPhone: string (buyer phone)
 * - sourceUrl: string (URL to detail page)
 *
 * Add any source-specific fields:
 * - Categories/codes (NIGP, NAICS, etc.)
 * - Event type
 * - Government type
 * - Special requirements
 * - etc.
 */
export const SOURCE_OPPORTUNITY = z.object({
    // TODO: Define opportunity schema fields
    // Example:
    // id: z.string(),
    // eventId: z.string(),
    // title: z.string().nullable().optional(),
    // description: z.string().nullable().optional(),
    // startDate: z.string().nullable().optional(),
    // endDate: z.string().nullable().optional(),
    // agencyName: z.string().nullable().optional(),
    // ... add more fields
})

/**
 * SOURCE_TO_INTAKE
 *
 * Container for a complete scraping session's data.
 * This is what gets saved to batch JSON files.
 *
 * TODO: Define your container schema
 *
 * Structure:
 * - metadata: Information about the scraping session
 *   - scrapedAt: ISO timestamp
 *   - source: Source name (e.g., "yourstate")
 *   - sourceUrl: Base URL of the source
 *   - dateRange: Date range that was scraped
 *   - totalItems: Number of items in this batch
 *
 * - items: Array of opportunities with their documents
 *   - opportunity: SOURCE_OPPORTUNITY data
 *   - documents: Array of SOURCE_DOCUMENT data
 */
export const SOURCE_TO_INTAKE = z.object({
    metadata: z.object({
        // TODO: Define metadata fields
        // Example:
        // scrapedAt: z.string(),
        // source: z.string(),
        // sourceUrl: z.string(),
        // dateRange: z.object({
        //   from: z.string(),
        //   to: z.string(),
        // }),
        // totalItems: z.number(),
    }),
    items: z.array(
        z.object({
            // TODO: Define item structure
            // Example:
            // opportunity: SOURCE_OPPORTUNITY,
            // documents: z.array(SOURCE_DOCUMENT),
        }),
    ),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SOURCE_DOCUMENT = z.infer<typeof SOURCE_DOCUMENT>
export type SOURCE_OPPORTUNITY = z.infer<typeof SOURCE_OPPORTUNITY>
export type SOURCE_TO_INTAKE = z.infer<typeof SOURCE_TO_INTAKE>
