/**
 * Base Transformer Classes
 * 
 * These transformers convert raw scraped data (SOURCE schemas)
 * into normalized intake data (INTAKE schemas).
 * 
 * Each transformer follows the Single Responsibility Principle
 * and handles one entity type.
 * 
 * Transformation responsibilities:
 * - Data normalization (dates, formats, etc.)
 * - Field mapping (source fields -> intake fields)
 * - Data enrichment (generating IDs, calculating values)
 * - Data cleaning (trimming, removing nulls, etc.)
 */

/**
 * ContractTransformer
 * 
 * Transforms raw opportunity data into normalized contract records.
 * 
 * Responsibilities:
 * - Map opportunity fields to contract schema
 * - Normalize dates to ISO format
 * - Generate unique contract IDs
 * - Extract and normalize monetary values
 * - Normalize status values
 */
export abstract class ContractTransformer {
	/**
	 * Transform raw opportunity data to contract intake format
	 * 
	 * @param opportunity - Raw opportunity from source schema
	 * @param source - Source name (e.g., 'georgia', 'texas')
	 * @returns Normalized contract data matching INTAKE_CONTRACT schema
	 * 
	 * TODO: Implement transformation logic
	 * - Map all required fields from source to intake schema
	 * - Normalize dates using parseDate()
	 * - Generate unique ID using generateContractId()
	 * - Extract and format monetary values
	 * - Normalize status/type enums
	 * - Handle optional fields gracefully
	 */
	public abstract transform(opportunity: any, source: string): any

	/**
	 * Parse date string to ISO format
	 */
	protected parseDate(dateStr: string | null): string | null {
		if (!dateStr) return null
		try {
			const date = new Date(dateStr)
			return isNaN(date.getTime()) ? null : date.toISOString()
		} catch {
			return null
		}
	}

	/**
	 * Generate unique contract ID
	 */
	protected generateContractId(eventId: string, source: string): string {
		return `contract-${source}-${eventId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
	}
}

/**
 * AgencyTransformer
 * 
 * Transforms raw agency data into normalized agency records.
 * 
 * Responsibilities:
 * - Extract agency from opportunity data
 * - Normalize agency names
 * - Generate unique agency IDs
 * - Map agency metadata
 */
export abstract class AgencyTransformer {
	/**
	 * Transform raw opportunity data to agency intake format
	 * 
	 * @param opportunity - Raw opportunity from source schema
	 * @param source - Source name
	 * @returns Normalized agency data matching INTAKE_AGENCY schema
	 * 
	 * TODO: Implement transformation logic
	 * - Extract agency fields from opportunity
	 * - Generate unique agency ID
	 * - Normalize agency name
	 * - Map agency code, type, etc.
	 * - Handle cases where agency is optional
	 */
	public abstract transform(opportunity: any, source: string): any

	/**
	 * Generate unique agency ID
	 */
	protected generateAgencyId(agencyCode: string, source: string): string {
		return `agency-${source}-${agencyCode}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
	}
}

/**
 * DocumentTransformer
 * 
 * Transforms raw document metadata into normalized document records.
 * 
 * Responsibilities:
 * - Map document fields
 * - Normalize file names
 * - Extract file types
 * - Link documents to contracts
 */
export abstract class DocumentTransformer {
	/**
	 * Transform raw document data to document intake format
	 * 
	 * @param document - Raw document from source schema
	 * @param contractId - Associated contract ID
	 * @param source - Source name
	 * @returns Normalized document data matching INTAKE_DOCUMENT schema
	 * 
	 * TODO: Implement transformation logic
	 * - Map document fields
	 * - Generate unique document ID
	 * - Extract file extension/type
	 * - Normalize file name
	 * - Link to contract via contractId
	 * - Handle file size, upload date, etc.
	 */
	public abstract transform(document: any, contractId: string, source: string): any

	/**
	 * Extract file extension from filename
	 */
	protected extractFileExtension(fileName: string): string {
		const match = fileName.match(/\.([^.]+)$/)
		return match ? match[1].toLowerCase() : 'unknown'
	}

	/**
	 * Generate unique document ID
	 */
	protected generateDocumentId(documentUrl: string, source: string): string {
		return `document-${source}-${documentUrl}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50)
	}
}

/**
 * PeopleTransformer
 * 
 * Transforms raw contact/people data into normalized people records.
 * 
 * Responsibilities:
 * - Extract contact information
 * - Normalize names, emails, phones
 * - Generate unique people IDs
 * - Link people to contracts
 */
export abstract class PeopleTransformer {
	/**
	 * Transform raw contact data to people intake format
	 * 
	 * @param opportunity - Raw opportunity with contact info
	 * @param contractId - Associated contract ID
	 * @param source - Source name
	 * @returns Normalized people data matching INTAKE_PEOPLE schema or null
	 * 
	 * TODO: Implement transformation logic
	 * - Extract contact/buyer information
	 * - Generate unique person ID
	 * - Normalize name (parse first/last if needed)
	 * - Normalize email and phone
	 * - Link to contract
	 * - Return null if no contact info
	 */
	public abstract transform(opportunity: any, contractId: string, source: string): any

	/**
	 * Normalize phone number
	 */
	protected normalizePhone(phone: string | null): string | null {
		if (!phone) return null
		return phone.replace(/[^0-9]/g, '').replace(/^1/, '')
	}

	/**
	 * Normalize email
	 */
	protected normalizeEmail(email: string | null): string | null {
		if (!email) return null
		const trimmed = email.trim().toLowerCase()
		return trimmed.includes('@') ? trimmed : null
	}

	/**
	 * Generate unique person ID
	 */
	protected generatePersonId(identifier: string, source: string): string {
		return `person-${source}-${identifier}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50)
	}
}

