import { Page } from 'playwright'
import { BaseExtractor } from '../../base/BaseExtractor'
import { PAeMarketplaceScraper } from '../../scrapers/PAeMarketplaceScraper'
import { generateId, getFilenameFromUrl, log } from '../../utils/helpers'

export interface DocumentExtractData {
	id: string
	title: string
	downloadUrl: string
	fileName: string
}

export class DocumentExtractor extends BaseExtractor<DocumentExtractData[]> {
	public readonly LOG_SOURCE = 'DocumentExtractor';

	public async extract(page: Page): Promise<DocumentExtractData[]> {
		const documents: DocumentExtractData[] = []

		try {
			// Look for document links in various common locations
			const documentSelectors = [
				{
					title: 'Overview',
					selector: '#ctl00_MainBody_lbl_Overview a',
				},
				{
					title: 'Contract File',
					selector: '#ctl00_MainBody_lbl_ContractFile a'
				},
				{
					title: 'Change Notice',
					selector: '#ctl00_MainBody_lbl_ChangeNotice a'
				},
			]

			for (const {title, selector} of documentSelectors) {
				const links = await page.locator(selector).all()
				
				for (const link of links) {
					const href = await this.extractAttribute(link, 'href') 
					
					if (href) {
						// Convert relative URLs to absolute
						const downloadUrl = href.startsWith('http') ? href : `${PAeMarketplaceScraper.BASE_URL}/${href}`
						
						documents.push({
							id: generateId(title),
							title,
							downloadUrl,
							fileName: getFilenameFromUrl(downloadUrl) ?? title,
						})
					}
				}
			}

			return documents
		} catch (error) {
			log(this.LOG_SOURCE, `Error extract: ${error}`, 'error')
			return []
		}
	}

	public async extractAward(page: Page): Promise<DocumentExtractData[]> {
		const documents: DocumentExtractData[] = []

		try {
			// Look for document links in various common locations
			const documentSelectors = [
				{
					title: 'Related Docs',
					selector: '#ctl00_MainBody_lbl_File a',
				},
			]

			for (const {title, selector} of documentSelectors) {
				const links = await page.locator(selector).all()
				
				for (const link of links) {
					const href = await this.extractAttribute(link, 'href') 
					
					if (href) {
						// Convert relative URLs to absolute
						const downloadUrl = href.startsWith('http') ? href : `${PAeMarketplaceScraper.BASE_URL}/${href}`
						
						documents.push({
							id: generateId(title),
							title,
							downloadUrl,
							fileName: getFilenameFromUrl(downloadUrl) ?? title,
						})
					}
				}
			}

			return documents
		} catch (error) {
			log(this.LOG_SOURCE, `Error extract: ${error}`, 'error')
			return []
		}
	}
}