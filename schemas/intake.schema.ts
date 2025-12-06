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
 */
export const INTAKE_CONTRACT = z.object({
	id: z.string(),
	externalId: z.string(),
	agencyId: z.string().nullable().optional(),
	supplierId: z.string().nullable().optional(),
	source: z.string(),
	title: z.string(),
	description: z.string().nullable().optional(),
	eventType: z.string().nullable().optional(),
	category: z.string().nullable().optional(),
	publishedAt: z.string().nullable().optional(),
	closingAt: z.string().nullable().optional(),
	status: z.string(),
	amount: z.number().nullable().optional(),
	sourceUrl: z.string().nullable().optional(),
	scrapedAt: z.string(),
	updatedAt: z.string().nullable().optional(),
})

/**
 * INTAKE_AWARD
 * 
 * Normalized Award data.
 */
export const INTAKE_AWARD = z.object({
	id: z.string(),
	contractId: z.string(),
	source: z.string(),
	agencyId: z.string().nullable().optional(),
	awardedToId: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	amount: z.number().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
	sourceUrl: z.string()
})

/**
 * INTAKE_AGENCY
 * 
 * Normalized agency data.
 */
export const INTAKE_AGENCY = z.object({
	id: z.string(),
	externalId: z.string(),
	source: z.string(),
	name: z.string(),
	type: z.string().nullable().optional(),
})

/**
 * INTAKE_DOCUMENT
 * 
 * Normalized document data.
 */
export const INTAKE_DOCUMENT = z.object({
	id: z.string(),
	contractId: z.string(),
	source: z.string(),
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number().nullable().optional(),
	fileUrl: z.string(),
	uploadedAt: z.string(),
})

/**
 * INTAKE_PEOPLE
 * 
 * Normalized contact/people data.
 */
export const INTAKE_PEOPLE = z.object({
	id: z.string(),
	contractId: z.string(),
	source: z.string(),
	name: z.string(),
	email: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	role: z.string(),
})

/**
 * INTAKE_OUTPUT
 * 
 * Container for the complete intake output.
 */
export const INTAKE_OUTPUT = z.object({
	contracts: z.array(INTAKE_CONTRACT),
	awards: z.array(INTAKE_AWARD),
	agencies: z.array(INTAKE_AGENCY),
	documents: z.array(INTAKE_DOCUMENT),
	people: z.array(INTAKE_PEOPLE),
	metadata: z.object({
		processedAt: z.string(),
		source: z.string(),
		totalContracts: z.number(),
		totalAgencies: z.number(),
		totalDocuments: z.number(),
		totalPeople: z.number(),
	}),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type INTAKE_CONTRACT = z.infer<typeof INTAKE_CONTRACT>
export type INTAKE_AWARD = z.infer<typeof INTAKE_AWARD>
export type INTAKE_AGENCY = z.infer<typeof INTAKE_AGENCY>
export type INTAKE_DOCUMENT = z.infer<typeof INTAKE_DOCUMENT>
export type INTAKE_PEOPLE = z.infer<typeof INTAKE_PEOPLE>
export type INTAKE_OUTPUT = z.infer<typeof INTAKE_OUTPUT>

