import { z } from 'zod'

/**
 * INTAKE SCHEMAS
 * 
 * These schemas represent the NORMALIZED, TRANSFORMED data
 * that will be ingested into the system.
 * 
 * These schemas follow a standardized structure across all sources.
 * 
 * Guidelines:
 * - Use consistent field names across all sources
 * - Normalize dates to ISO 8601 format
 * - Clean and validate data
 * - Use enums for status/type fields where possible
 * - Generate deterministic IDs
 */

/**
 * INTAKE_CONTRACT
 * 
 * Normalized contract/opportunity data ready for ingestion.
 * 
 * TODO: Define your contract intake schema
 * 
 * Standard fields to include:
 * - id: string (unique, deterministic ID)
 * - externalId: string (original ID from source)
 * - source: string (source name, e.g., "yourstate")
 * - title: string (normalized title)
 * - description: string (cleaned description)
 * - publishedAt: string (ISO date)
 * - closingAt: string (ISO date)
 * - status: string (normalized: "open", "closed", "awarded", etc.)
 * - agencyId: string (link to agency)
 * - contactIds: string[] (links to people)
 * - amount: number (estimated value, if available)
 * - sourceUrl: string (link to original listing)
 * - scrapedAt: string (ISO timestamp)
 * 
 * Add normalized versions of source-specific fields.
 */
export const INTAKE_CONTRACT = z.object({
	// TODO: Define contract intake schema fields
	// Example:
	// id: z.string(),
	// externalId: z.string(),
	// source: z.string(),
	// title: z.string(),
	// description: z.string().nullable().optional(),
	// publishedAt: z.string().nullable().optional(),
	// closingAt: z.string().nullable().optional(),
	// ... add more fields
})

/**
 * INTAKE_AGENCY
 * 
 * Normalized agency data.
 * 
 * TODO: Define your agency intake schema
 * 
 * Standard fields to include:
 * - id: string (unique, deterministic ID)
 * - externalId: string (agency code from source)
 * - source: string
 * - name: string (normalized agency name)
 * - type: string (government type: "state", "county", "city", etc.)
 * - website: string (agency website, if available)
 * - location: object (address info, if available)
 */
export const INTAKE_AGENCY = z.object({
	// TODO: Define agency intake schema fields
	// Example:
	// id: z.string(),
	// externalId: z.string(),
	// source: z.string(),
	// name: z.string(),
	// type: z.string().nullable().optional(),
	// ... add more fields
})

/**
 * INTAKE_DOCUMENT
 * 
 * Normalized document data.
 * 
 * TODO: Define your document intake schema
 * 
 * Standard fields to include:
 * - id: string (unique, deterministic ID)
 * - contractId: string (link to contract)
 * - source: string
 * - fileName: string (normalized file name)
 * - fileType: string (extension: "pdf", "doc", "xlsx", etc.)
 * - fileSize: number (bytes)
 * - fileUrl: string (local path or storage URL)
 * - uploadedAt: string (ISO timestamp)
 */
export const INTAKE_DOCUMENT = z.object({
	// TODO: Define document intake schema fields
	// Example:
	// id: z.string(),
	// contractId: z.string(),
	// source: z.string(),
	// fileName: z.string(),
	// fileType: z.string(),
	// fileUrl: z.string(),
	// ... add more fields
})

/**
 * INTAKE_PEOPLE
 * 
 * Normalized contact/people data.
 * 
 * TODO: Define your people intake schema
 * 
 * Standard fields to include:
 * - id: string (unique, deterministic ID)
 * - contractId: string (link to contract)
 * - source: string
 * - name: string (full name)
 * - email: string (normalized email)
 * - phone: string (normalized phone)
 * - role: string (e.g., "buyer", "contact", "officer")
 */
export const INTAKE_PEOPLE = z.object({
	// TODO: Define people intake schema fields
	// Example:
	// id: z.string(),
	// contractId: z.string(),
	// source: z.string(),
	// name: z.string(),
	// email: z.string().nullable().optional(),
	// phone: z.string().nullable().optional(),
	// ... add more fields
})

/**
 * INTAKE_OUTPUT
 * 
 * Container for the complete intake output.
 * This is what gets saved to the final intake JSON file.
 * 
 * TODO: Define your intake output schema
 * 
 * Structure:
 * - contracts: Array of INTAKE_CONTRACT
 * - agencies: Array of INTAKE_AGENCY (deduplicated)
 * - documents: Array of INTAKE_DOCUMENT
 * - people: Array of INTAKE_PEOPLE (deduplicated)
 * - metadata: Processing metadata
 */
export const INTAKE_OUTPUT = z.object({
	// TODO: Define intake output structure
	// Example:
	// contracts: z.array(INTAKE_CONTRACT),
	// agencies: z.array(INTAKE_AGENCY),
	// documents: z.array(INTAKE_DOCUMENT),
	// people: z.array(INTAKE_PEOPLE),
	// metadata: z.object({
	//   processedAt: z.string(),
	//   source: z.string(),
	//   totalContracts: z.number(),
	//   totalAgencies: z.number(),
	//   totalDocuments: z.number(),
	//   totalPeople: z.number(),
	// }),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type INTAKE_CONTRACT = z.infer<typeof INTAKE_CONTRACT>
export type INTAKE_AGENCY = z.infer<typeof INTAKE_AGENCY>
export type INTAKE_DOCUMENT = z.infer<typeof INTAKE_DOCUMENT>
export type INTAKE_PEOPLE = z.infer<typeof INTAKE_PEOPLE>
export type INTAKE_OUTPUT = z.infer<typeof INTAKE_OUTPUT>

