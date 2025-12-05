/**
 * INTAKE ENTRY POINT
 * 
 * This script processes the raw scraped data (SOURCE schemas)
 * and transforms it into normalized intake data (INTAKE schemas).
 * 
 * Usage:
 * - npm run intake <session_directory>
 * 
 * Example:
 * - npm run intake ./output/source/session_yourstate_2024-01-15_1705334400000
 * 
 * The intake will:
 * 1. Read all batch files from the session directory
 * 2. Transform each opportunity using transformers
 * 3. Deduplicate agencies and people
 * 4. Generate intake output file
 * 5. Output intake file location
 */

import { readBatchFiles, saveIntakeToFile } from '../utils/storage'
import { 
	ContractTransformer,
	AgencyTransformer,
	DocumentTransformer,
	PeopleTransformer 
} from '../base/BaseTransformer'
import { deduplicateBy, log } from '../utils/helpers'
import { SOURCE_TO_INTAKE } from '../schemas/PAeMarketplace/source.schema'
import { INTAKE_OUTPUT } from '../schemas/PAeMarketplace/intake.schema'

/**
 * PennsylvaniaContractTransformer
 */
class PennsylvaniaContractTransformer extends ContractTransformer {
	public transform(opportunity: any, source: string): any {
		return {
			id: this.generateContractId(opportunity.eventId, source),
			externalId: opportunity.eventId,
			source: source,
			title: opportunity.title || 'Untitled Opportunity',
			description: opportunity.description,
			publishedAt: this.parseDate(opportunity.startDate),
			closingAt: this.parseDate(opportunity.endDate),
			status: this.normalizeStatus(opportunity.status),
			agencyId: this.generateAgencyId(opportunity.agencyCode || opportunity.agencyName, source),
			amount: this.parseAmount(opportunity.amount),
			sourceUrl: opportunity.sourceUrl,
			scrapedAt: new Date().toISOString(),
			category: opportunity.category,
			eventType: opportunity.eventType,
		}
	}

	protected parseDate(dateStr: string | null): string | null {
		if (!dateStr) return null
		try {
			const date = new Date(dateStr)
			return isNaN(date.getTime()) ? null : date.toISOString()
		} catch {
			return null
		}
	}

	protected generateContractId(eventId: string, source: string): string {
		return `contract-${source}-${eventId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
	}

	private generateAgencyId(agencyCode: string | null, source: string): string {
		if (!agencyCode) return `agency-${source}-unknown`
		return `agency-${source}-${agencyCode}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
	}

	private normalizeStatus(status: string | null): string {
		if (!status) return 'unknown'
		const lower = status.toLowerCase()
		if (lower.includes('open') || lower.includes('active')) return 'open'
		if (lower.includes('closed') || lower.includes('expired')) return 'closed'
		if (lower.includes('awarded')) return 'awarded'
		return 'unknown'
	}

	private parseAmount(amountStr: string | null): number | null {
		if (!amountStr) return null
		const cleaned = amountStr.replace(/[$,]/g, '')
		const num = parseFloat(cleaned)
		return isNaN(num) ? null : num
	}
}

/**
 * PennsylvaniaAgencyTransformer
 */
class PennsylvaniaAgencyTransformer extends AgencyTransformer {
	public transform(opportunity: any, source: string): any {
		if (!opportunity.agencyName && !opportunity.agencyCode) return null
		
		return {
			id: this.generateAgencyId(opportunity.agencyCode || opportunity.agencyName, source),
			externalId: opportunity.agencyCode || opportunity.agencyName,
			source: source,
			name: opportunity.agencyName || opportunity.agencyCode,
			type: 'state',
		}
	}

	protected generateAgencyId(agencyCode: string, source: string): string {
		return `agency-${source}-${agencyCode}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
	}
}

/**
 * PennsylvaniaDocumentTransformer
 */
class PennsylvaniaDocumentTransformer extends DocumentTransformer {
	public transform(document: any, contractId: string, source: string): any {
		return {
			id: this.generateDocumentId(document.downloadUrl, source),
			contractId: contractId,
			source: source,
			fileName: document.fileName,
			fileType: this.extractFileExtension(document.fileName),
			fileSize: document.fileSize,
			fileUrl: document.downloadUrl,
			uploadedAt: document.createdAt,
		}
	}

	protected extractFileExtension(fileName: string): string {
		const match = fileName.match(/\.([^.]+)$/)
		return match ? match[1].toLowerCase() : 'unknown'
	}

	protected generateDocumentId(documentUrl: string, source: string): string {
		return `document-${source}-${documentUrl}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50)
	}
}

/**
 * PennsylvaniaPeopleTransformer
 */
class PennsylvaniaPeopleTransformer extends PeopleTransformer {
	public transform(opportunity: any, contractId: string, source: string): any {
		if (!opportunity.contactEmail && !opportunity.contactName) {
			return null
		}
		
		return {
			id: this.generatePersonId(opportunity.contactEmail || opportunity.contactName, source),
			contractId: contractId,
			source: source,
			name: opportunity.contactName || 'Unknown Contact',
			email: this.normalizeEmail(opportunity.contactEmail),
			phone: this.normalizePhone(opportunity.contactPhone),
			role: 'buyer',
		}
	}

	protected normalizePhone(phone: string | null): string | null {
		if (!phone) return null
		return phone.replace(/[^0-9]/g, '').replace(/^1/, '')
	}

	protected normalizeEmail(email: string | null): string | null {
		if (!email) return null
		const trimmed = email.trim().toLowerCase()
		return trimmed.includes('@') ? trimmed : null
	}

	protected generatePersonId(identifier: string, source: string): string {
		return `person-${source}-${identifier}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50)
	}
}

/**
 * Process intake
 * 
 * Main function that orchestrates the intake process.
 */
async function processIntake(sessionDir: string): Promise<void> {
	try {
		log('intake', 'Starting intake process...', 'info')
		log('intake', `Reading from: ${sessionDir}`, 'info')

		// Read all batch files
		const batches = await readBatchFiles(sessionDir)
		log('intake', `Found ${batches.length} batch files`, 'info')

		// TODO: Validate batch data against SOURCE_TO_INTAKE schema
		// for (const batch of batches) {
		//   SOURCE_TO_INTAKE.parse(batch)
		// }

		// Initialize transformers
		const contractTransformer = new PennsylvaniaContractTransformer()
		const agencyTransformer = new PennsylvaniaAgencyTransformer()
		const documentTransformer = new PennsylvaniaDocumentTransformer()
		const peopleTransformer = new PennsylvaniaPeopleTransformer()

		// Initialize output collections
		const contracts: any[] = []
		const agencies: any[] = []
		const documents: any[] = []
		const people: any[] = []

		const source = batches[0]?.metadata?.source || 'unknown'

		// Process each batch
		for (const batch of batches) {
			for (const item of batch.items) {
				// Transform contract
				const contract = contractTransformer.transform(item.opportunity, source)
				contracts.push(contract)

				// Transform agency
				const agency = agencyTransformer.transform(item.opportunity, source)
				if (agency) agencies.push(agency)

				// Transform documents
				for (const doc of item.documents) {
					const document = documentTransformer.transform(doc, contract.id, source)
					documents.push(document)
				}

				// Transform people
				const person = peopleTransformer.transform(item.opportunity, contract.id, source)
				if (person) people.push(person)
			}
		}

		log('intake', `Processed ${contracts.length} contracts`, 'info')

		// Deduplicate agencies and people
		const uniqueAgencies = deduplicateBy(agencies, (a) => a.id)
		const uniquePeople = deduplicateBy(people, (p) => p.id)

		// Create intake output
		const output = {
			contracts: contracts,
			agencies: uniqueAgencies,
			documents: documents,
			people: uniquePeople,
			metadata: {
				processedAt: new Date().toISOString(),
				source: source,
				totalContracts: contracts.length,
				totalAgencies: uniqueAgencies.length,
				totalDocuments: documents.length,
				totalPeople: uniquePeople.length,
			},
		}

		// TODO: Validate output against INTAKE_OUTPUT schema
		// INTAKE_OUTPUT.parse(output)

		// Save intake output
		const fileName = `intake_${source}_${Date.now()}`
		await saveIntakeToFile(output, fileName)

		log('intake', 'Intake process complete!', 'info')
		log('intake', `Output file: ./output/intake/${fileName}.json`, 'info')

	} catch (error) {
		log('intake', `Fatal error: ${error}`, 'error')
		throw error
	}
}

/**
 * Main execution
 */
async function main() {
	try {
		// Get session directory from command line arguments
		const sessionDir = process.argv[2]

		if (!sessionDir) {
			console.error('Usage: npm run intake <session_directory>')
			console.error('Example: npm run intake ./output/source/session_yourstate_2024-01-15_1705334400000')
			process.exit(1)
		}

		await processIntake(sessionDir)
		process.exit(0)
	} catch (error) {
		console.error('Fatal error:', error)
		process.exit(1)
	}
}

// Run if this is the main module
if (require.main === module) {
	main()
}


