/**
 * SCRAPER ENTRY POINT
 * 
 * This is the main entry point for your scraper.
 * Run this script to scrape data from your target website.
 * 
 * Usage:
 * - npm run scraper (scrapes yesterday)
 * - npm run scraper --today (scrapes today)
 * - npm run scraper --date-range=2024-01-01,2024-01-31
 * 
 * The scraper will:
 * 1. Parse CLI arguments for date range
 * 2. Initialize browser and session
 * 3. Fetch paginated listings
 * 4. Process each opportunity (extract details, download documents)
 * 5. Save data incrementally in batches
 * 6. Output session directory location
 */

import { ScraperConfig } from '../base/BaseScraper'
import { parseArgs } from '../utils/cli'
import { log } from '../utils/helpers'
import { PAeMarketplaceScraper } from '../scrapers/PAeMarketplaceScraper'
import { ContractExtractor } from '../extractors/PAeMarketplace/ContractExtractor'
import { DocumentExtractor } from '../extractors/PAeMarketplace/DocumentExtractor'

/**
 * Main execution
 */
async function main() {
	try {
		const { source, startPage, endPage, batchSize } = parseArgs();

		switch (source) {
			case 'PA':
				const PaConfig: ScraperConfig = {
					source: 'pennsylvania',
					startPage: startPage ?? 1,
					endPage: endPage ?? 10,
					batchSize: batchSize ?? 10,
				}

				log('scraper', `Starting Pennsylvania eMarketplace scraper - Page (${startPage} to ${endPage})`, 'info')

				// Create ContractExtractor and DocumentExtractor instances
				const contractExtractor = new ContractExtractor();
				// Create DocumentExtractor instance
				const documentExtractor = new DocumentExtractor();

				const scraper = new PAeMarketplaceScraper(PaConfig, contractExtractor, documentExtractor);
				  
				// Create and run scraper
				const result = await scraper.run()

				log('scraper', `Finished - Session directory: ${result.sessionDir}, Total items scraped: ${result.itemsCount}`, 'info')

				break
			default:
				throw new Error(`Invalid source: ${source}`)
		}

		process.exit(0)
	} catch (error) {
		log('scraper', `Fatal error: ${error}`, 'error')
		console.error(error)
		process.exit(1)
	}
}

// Run if this is the main module
if (require.main === module) {
	main()
}


