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
import { deduplicateBy, log } from '../utils/helpers'
import { SOURCE_DOCUMENT, SOURCE_OPPORTUNITY, SOURCE_TO_INTAKE } from '../schemas/PAeMarketplace/source.schema'
import { INTAKE_AGENCY, INTAKE_AWARD, INTAKE_CONTRACT, INTAKE_DOCUMENT, INTAKE_OUTPUT, INTAKE_PEOPLE } from '../schemas/intake.schema'
import { PennsylvaniaAgencyTransformer } from '../transformers/PAeMarketplace/AgencyTransformer'
import { PennsylvaniaContractTransformer } from '../transformers/PAeMarketplace/ContractTransformer'
import { PennsylvaniaDocumentTransformer } from '../transformers/PAeMarketplace/DocumentTransformer'
import { PennsylvaniaPeopleTransformer } from '../transformers/PAeMarketplace/PeopleTransformer'
import { PennsylvaniaSupplierTransformer } from '../transformers/PAeMarketplace/SupplierTransformer'
import { ContractTransformer, PeopleTransformer, DocumentTransformer, AgencyTransformer, AwardTransformer } from '../base/BaseTransformer'
import { PennsylvaniaAwardTransformer } from '../transformers/PAeMarketplace/AwardTransformer'

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
		const batches = await readBatchFiles(sessionDir);

		if (batches.length === 0) {
			throw new Error('No batch files found')
		};

		log('intake', `Found ${batches.length} batch files`, 'info')

		// TODO: Validate batch data against SOURCE_TO_INTAKE schema
		for (const batch of batches) {
		  SOURCE_TO_INTAKE.parse(batch)
		}
		 
		// Initialize output collections
		const source = batches[0]?.metadata?.source || 'unknown'
		let contractTransformer: ContractTransformer;
		let awardTransformer: AwardTransformer;
		let agencyTransformer: AgencyTransformer;
		let supplierTransformer: AgencyTransformer;
		let documentTransformer: DocumentTransformer;
		let peopleTransformer: PeopleTransformer;

		switch (source) {
			case 'pennsylvania':
				contractTransformer = new PennsylvaniaContractTransformer()
				awardTransformer = new PennsylvaniaAwardTransformer()
				agencyTransformer = new PennsylvaniaAgencyTransformer()
				supplierTransformer = new PennsylvaniaSupplierTransformer()
				documentTransformer = new PennsylvaniaDocumentTransformer()
				peopleTransformer = new PennsylvaniaPeopleTransformer()
				break;
			default:
				throw new Error(`Unknown source: ${source}`)
		}
		
		const contracts: INTAKE_CONTRACT[] = []
		const awards: INTAKE_AWARD[] = []
		const agencies: INTAKE_AGENCY[] = []
		const documents: INTAKE_DOCUMENT[] = []
		const people: INTAKE_PEOPLE[] = []
		// Process each batch
		for (const batch of batches as SOURCE_TO_INTAKE[]) {
			for (const item of batch.items as SOURCE_OPPORTUNITY[]) {
				// Transform contract
				const contract: INTAKE_CONTRACT = contractTransformer.transform(item.contract, source)
				contract.sourceUrl = item.url
				contract.scrapedAt = batch.metadata.scrapedAt
				contracts.push(contract)

				// Transform award
				const award = awardTransformer.transform(item.contract, contract.id, source)
				if (award) awards.push(award)

				// Transform agency
				const agency = agencyTransformer.transform(item.contract, source)
				if (agency) agencies.push(agency)

				// Transform supplier
				const supplier = supplierTransformer.transform(item.contract, source)
				if (supplier) agencies.push(supplier)

				// Transform documents
				for (const doc of item.documents as SOURCE_DOCUMENT[]) {
					const document = documentTransformer.transform(doc, contract.id, source)
					documents.push(document)
				}

				// Transform people
				const person = peopleTransformer.transform(item.contract, contract.id, source)
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
			awards: awards,
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
		INTAKE_OUTPUT.parse(output)

		// Save intake output
		const sessionName = sessionDir.split('/').pop() || sessionDir.split('\\').pop() || 'unknown'
		const fileName = `intake_${source}_${Date.now()}`
		const savedIntakePath = await saveIntakeToFile(output, sessionName, fileName)

		log('intake', 'Intake process complete!', 'info')
		log('intake', `Output file: ${savedIntakePath}`, 'info')

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
			console.error('Example: npm run intake ./output/source/session_yourstate_xxx')
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


