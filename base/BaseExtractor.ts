import { Page, Locator } from 'playwright'

/**
 * BaseExtractor
 * 
 * Base class for extracting data from web pages using Playwright.
 * 
 * Extractors follow the Single Responsibility Principle - each extractor
 * should handle one specific type of data extraction.
 * 
 * Example extractors:
 * - OpportunityExtractor: Extracts basic opportunity info (title, dates, description)
 * - DocumentExtractor: Extracts document metadata
 * - ContactExtractor: Extracts contact information
 * - TabDataExtractor: Extracts data from tabbed sections
 * 
 * Use Playwright locators for type-safe DOM querying.
 */
export abstract class BaseExtractor<T> {
	/**
	 * Main extraction method
	 * 
	 * This method should contain the logic to extract data from the page.
	 * 
	 * @param page - Playwright page instance
	 * @returns Extracted data of type T
	 * 
	 * TODO: Implement extraction logic in your concrete extractor
	 * - Wait for page to load
	 * - Use locators to find elements
	 * - Extract text, attributes, or other data
	 * - Return structured data
	 */
	public abstract extract(page: Page): Promise<T>

	/**
	 * Extract text from a locator
	 */
	protected async extractText(locator: Locator): Promise<string | null> {
		try {
			const count = await locator.count()
			if (count === 0) return null
			
			const text = await locator.textContent()
			if (!text) return null
			
			const trimmed = text.trim()
			return trimmed || null
		} catch {
			return null
		}
	}

	/**
	 * Extract attribute from a locator
	 */
	protected async extractAttribute(
		locator: Locator,
		attribute: string
	): Promise<string | null> {
		try {
			const count = await locator.count()
			if (count === 0) return null
			
			return await locator.getAttribute(attribute)
		} catch {
			return null
		}
	}

	/**
	 * Extract data from a table
	 */
	protected async extractTable(
		page: Page,
		tableSelector: string
	): Promise<Record<string, string>[]> {
		try {
			const table = page.locator(tableSelector)
			if (await table.count() === 0) return []
			
			const headers = await table.locator('th').allTextContents()
			const rows = await table.locator('tbody tr').all()
			
			const result = []
			for (const row of rows) {
				const cells = await row.locator('td').allTextContents()
				const rowData: Record<string, string> = {}
				
				for (let i = 0; i < headers.length && i < cells.length; i++) {
					rowData[headers[i].trim()] = cells[i].trim()
				}
				
				result.push(rowData)
			}
			
			return result
		} catch {
			return []
		}
	}

	/**
	 * Extract data from multiple possible selectors
	 */
	protected async extractFromMultipleSelectors(
		page: Page,
		selectors: string[]
	): Promise<string | null> {
		for (const selector of selectors) {
			const result = await this.extractText(page.locator(selector))
			if (result) return result
		}
		return null
	}

	/**
	 * Wait for and click a tab, then wait for content
	 */
	protected async clickTab(page: Page, tabSelector: string): Promise<boolean> {
		try {
			const tab = page.locator(tabSelector)
			if (await tab.count() === 0) return false
			
			await tab.click()
			await page.waitForTimeout(1000) // Wait for content to load
			return true
		} catch {
			return false
		}
	}
}

