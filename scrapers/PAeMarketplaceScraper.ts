import { chromium, Browser, Page } from 'playwright'
import { BaseScraper, ScraperConfig } from '../base/BaseScraper'
import { 
	createSessionDirectory, 
	saveBatchToFile, 
	generateSessionName,
	downloadFileLocally 
} from '../utils/storage'
import { log, delay } from '../utils/helpers'
import { ContractExtractor } from '../extractors/PAeMarketplace/ContractExtractor'
import { AwardExtractor } from '../extractors/PAeMarketplace/AwardExtractor'
import { DocumentExtractor, DocumentExtractData } from '../extractors/PAeMarketplace/DocumentExtractor'
import { SOURCE_AWARD, SOURCE_CONTRACT, SOURCE_DOCUMENT, SOURCE_LISTING, SOURCE_OPPORTUNITY, SOURCE_TO_INTAKE } from '../schemas/PAeMarketplace/source.schema'

/**
 * PAeMarketplaceScraper
 * 
 * Concrete implementation of BaseScraper for Pennsylvania eMarketplace.
 */
export class PAeMarketplaceScraper extends BaseScraper {
	public static readonly BASE_URL = 'https://www.emarketplace.state.pa.us'
	private static readonly BID_CONTRACTS_URL: string = `${this.BASE_URL}/BidContracts.aspx`
	private static readonly BID_CONTRACT_DETAILS_URL = `${this.BASE_URL}/BidContractDetails.aspx?ContractNo=`;
	private pager_start = 1;
	private pager_end = 11;
	private pager_selected = 1;

	constructor(
		config: ScraperConfig,
		private contractExtractor: ContractExtractor,
		private awardExtractor: AwardExtractor,
		private documentExtractor: DocumentExtractor
	) {
		super(config)
		this.LOG_SOURCE = this.constructor.name;
	}
	
	private async goToPage(page: Page, num: number): Promise<void> {
		const pageLink = page.locator(`a[href="javascript:__doPostBack('ctl00$MainBody$gvDGSBidContracts','Page$${num}')"]`);
		const count = await pageLink.count();
		if (count === 0) return;
		await pageLink.click()
	}

	/**
	 * Navigate to a specific page using __doPostBack
	 */
	private async navigateToPage(page: Page, pageNumber: number): Promise<void> {
		try {
			if (this.pager_selected == pageNumber) return;
			while(pageNumber > this.pager_end) {
				await this.goToPage(page, this.pager_end);
				await delay(5000);
				this.pager_start = this.pager_end - 1;
				this.pager_end = this.pager_end + 10;
			}

			await this.goToPage(page, pageNumber);
			await delay(5000);
			this.pager_selected = pageNumber;

		} catch (error) {
			throw Error(`Error navigating to page ${pageNumber}: ${error}`);
		}
	}

	/**
	 * Initiate listing page
	 */
	protected async initListings(page: Page) {
		try {
			// Navigate to the main bid contracts page
			await page.goto(PAeMarketplaceScraper.BID_CONTRACTS_URL, { waitUntil: 'networkidle' });
			// Wait for the page to load
			await page.waitForSelector('#aspnetForm', { timeout: 10000 });

			// Select 'Search by' option
			const searchBySel = await page.locator('select[name="ctl00$MainBody$ddlSearch"]').first();
			if (!searchBySel) {
				throw Error('"Search by" selector not found');
			}
			await searchBySel.selectOption('All Items');

			// Select 'Display' option
			const displaySel = await page.locator('select[name="ctl00$MainBody$ddlPages"]').first();
			if (!displaySel) {
				throw Error('"Display" selector not found');
			}
			await displaySel.selectOption(`${this.config.batchSize ?? ''}`);

			await page.click('#ctl00_MainBody_rdoBoth'); // select both

			await page.click('#ctl00_MainBody_btnSearch');

			// wait 5 seconds
			await delay(5 * 1000);
		}
		catch (error) {
			throw Error(`Error initListings: ${error}`)
		}
	}

	/**
	 * Fetch paginated listings from Pennsylvania eMarketplace
	 */
	protected async fetchListings(
		page: Page,
		pageNumber: number,
		pageSize: number
	): Promise<SOURCE_LISTING[]> {
		try {
			// Navigate to the requested page if not the first page
			await this.navigateToPage(page, pageNumber);

			// Look for opportunity links in the page
			const links = await page.locator('a[title="Contract Details"]').all()
			
			const listings: SOURCE_LISTING[] = [];
			for (const link of links) {
				const text = await link.textContent();
				if (text) {
					const fullUrl = PAeMarketplaceScraper.BID_CONTRACT_DETAILS_URL + text;
					listings.push({
						id: text.trim(), //generateId(text.trim()),
						title: text.trim(),
						url: fullUrl
					})
				}
			}
			
			log(this.LOG_SOURCE, `Found ${listings.length} listings on page ${pageNumber}`, 'info')
			
			return listings.slice(0, pageSize) // Limit to page size
			
		} catch (error) {
			throw Error(`Error fetching listings: ${error}`)
		}
	}

	/**
	 * Process a single opportunity
	 */
	protected async processOpportunity(
		browser: Browser,
		listing: SOURCE_LISTING
	): Promise<SOURCE_OPPORTUNITY | null> {
		const page = await browser.newPage()
		
		try {
			log(this.LOG_SOURCE, `Processing opportunity: ${listing.title}`, 'info')
			
			// Navigate to detail page
			await page.goto(listing.url!, { waitUntil: 'networkidle' })
			
			// Wait for the main content to load
			await page.waitForSelector('#aspnetForm', { timeout: 10000 })

			// Extract opportunity data
			const contract: SOURCE_CONTRACT = await this.contractExtractor.extract(page)
			
			// Extract documents
			const documentsData: DocumentExtractData[] = await this.documentExtractor.extract(page)
			
			// Download documents
			const documents: SOURCE_DOCUMENT[] = []
			for (const doc of documentsData) {
				try {
					const {localPath, fileSize} = await downloadFileLocally(
						doc.downloadUrl,
						listing.id,
						doc.fileName
					)

					documents.push({
						id: doc.id,
						contractId: listing.id,
						title: doc.title,
						fileName: doc.fileName,
						downloadUrl: doc.downloadUrl,
						localPath: localPath,
						fileType: doc.fileName.split('.').pop()?.toLowerCase() || '',
						fileSize
					})

					delay(3000);
				} catch (error) {
					// log(this.LOG_SOURCE, `Failed to download document ${doc.fileName}: ${error}`, 'warn')
				}
			}

			// check if it was awarded.
			if (contract.awardsLink != 'N/A') {
				// Extract opportunity data
				const awardResult = await this.processAwards(browser, contract);
				if (awardResult) {
					contract.awards = awardResult.awardData;
					documents.push(...awardResult.documents);
				}
			}
			
			// Create opportunity object
			const opportunity: SOURCE_OPPORTUNITY = {
				id: contract.id,
				url: listing.url!,
				contract,
				documents,
			}

			return opportunity;
			
		} catch (error) {
			log(this.LOG_SOURCE, `Error processing opportunity ${listing.title}: ${error}`, 'error')
			return null
		} finally {
			await page.close()
		}
	}

	private async processAwards( browser: Browser, contract: SOURCE_CONTRACT ): Promise<{awardData: SOURCE_AWARD, documents: SOURCE_DOCUMENT[]} | null> {
		const page = await browser.newPage()
		
		try {
			log(this.LOG_SOURCE, `Processing award: ${contract.awardsLink}`, 'info')
			
			// Navigate to detail page
			await page.goto(`${PAeMarketplaceScraper.BASE_URL}/${contract.awardsLink}`, { waitUntil: 'networkidle' })
			
			// Wait for the main content to load
			await page.waitForSelector('#aspnetForm', { timeout: 10000 })

			// search for open 
			let awardRecordId = null;
			await page.click('#ctl00_MainBody_rdoOpen'); // select open
			await page.click('#ctl00_MainBody_btnSearch');
			delay(5000);
			awardRecordId = await this.awardExtractor.extractAwardsDetailsLink(page);
			
			if (!awardRecordId) {
				await page.click('#ctl00_MainBody_rdoArch'); // select archive
				await page.click('#ctl00_MainBody_btnSearch');
				delay(5000);
				awardRecordId = await this.awardExtractor.extractAwardsDetailsLink(page);
			}

			if (!awardRecordId) {
				throw Error(`No award found for contract ${contract.id}`);
			}

			const sourceUrl = `${PAeMarketplaceScraper.BASE_URL}/BidAwardDetails.aspx?RecordNo=${awardRecordId}`;
			// Navigate to award detail page
			await page.goto(sourceUrl, { waitUntil: 'networkidle' })
			// Wait for the main content to load
			await page.waitForSelector('#aspnetForm', { timeout: 10000 })
			
			// Extract awards data
			const awardData: SOURCE_AWARD = await this.awardExtractor.extract(page)
			awardData.sourceUrl = sourceUrl;

			// Extract documents
			const documentsData: DocumentExtractData[] = await this.documentExtractor.extractAward(page)
			
			// Download documents
			const documents: SOURCE_DOCUMENT[] = []
			for (const doc of documentsData) {
				try {
					const {localPath, fileSize} = await downloadFileLocally(
						doc.downloadUrl,
						contract.id,
						doc.fileName
					)

					documents.push({
						id: doc.id,
						contractId: contract.id,
						title: doc.title,
						fileName: doc.fileName,
						downloadUrl: doc.downloadUrl,
						localPath: localPath,
						fileType: doc.fileName.split('.').pop()?.toLowerCase() || '',
						fileSize
					})

					delay(3000);
				} catch (error) {
					// log(this.LOG_SOURCE, `Failed to download document ${doc.fileName}: ${error}`, 'warn')
				}
			}

			return {
				awardData,
				documents
			};
			
		} catch (error) {
			log(this.LOG_SOURCE, `Error processing award ${contract.awardsLink}: ${error}`, 'error')
			return null
		} finally {
			await page.close()
		}
	}

	/**
	 * Save batch data to file
	 */
	protected async saveBatch(items: SOURCE_OPPORTUNITY[]): Promise<void> {
		const output: SOURCE_TO_INTAKE = {
			metadata: {
				source: this.config.source,
				scrapedAt: new Date().toISOString(),
				sourceUrl: PAeMarketplaceScraper.BID_CONTRACTS_URL,
				pageRange: {
					from: this.config.startPage,
					to: this.config.endPage,
				},
				totalItems: items.length,
			},
			items: items,
		}

		await saveBatchToFile(output, this.sessionDirName, this.batchNum)
		this.batchNum++
		log(this.LOG_SOURCE, `Saved batch ${this.batchNum - 1} with ${items.length} items`, 'info')
	}

	/**
	 * Launch browser
	 */
	protected async launchBrowser(): Promise<Browser> {
		return await chromium.launch({
			headless: false,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
		})
	}

	/**
	 * Create session directory
	 */
	protected async createSessionDirectory(): Promise<void> {
		this.sessionDirName = await createSessionDirectory(generateSessionName(
			this.config.source,
			`page${this.config.startPage}-page${this.config.endPage}`
		), 'source')
		log(this.LOG_SOURCE, `Created session directory: ${this.sessionDirName}`, 'info')
	}
}