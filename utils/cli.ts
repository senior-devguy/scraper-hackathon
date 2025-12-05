/**
 * CLI Utilities
 * 
 * Parse command line arguments and provide date range utilities.
 * 
 * Supported flags:
 * - --today: Scrape data from today only
 * - --date-range=yyyy-MM-dd,yyyy-MM-dd: Scrape data from custom date range
 * - Default: Scrape data from previous day
 * 
 * Examples:
 * - npm run scraper (scrapes yesterday)
 * - npm run scraper --today (scrapes today)
 * - npm run scraper --date-range=2024-01-01,2024-01-31 (scrapes January 2024)
 */

export interface DateRange {
	from: Date
	to: Date
}

/**
 * Parse command line arguments
 * 
 * Extracts CLI flags from process.argv and returns parsed options.
 * 
 * @returns Parsed CLI options
 * 
 * TODO: Implement argument parsing
 * - Parse process.argv
 * - Look for --today flag
 * - Look for --date-range flag with format validation
 * - Return object with parsed options
 */
export function parseArgs(): {
	isToday: boolean
	dateRange: string | null,
	source: string | null,
	startPage: number | null,
	endPage: number | null,
	batchSize: number | null
} {
	const args = process.argv.slice(2)
	
	const sourceArg = args.find(arg => arg.startsWith('--source='))
	const source = sourceArg ? sourceArg.split('=')[1] : null

	const startPageArg = args.find(arg => arg.startsWith('--start-page='))
	const startPage = startPageArg ? parseInt(startPageArg.split('=')[1]) : null

	const endPageArg = args.find(arg => arg.startsWith('--end-page='))
	const endPage = endPageArg ? parseInt(endPageArg.split('=')[1]) : null

	const batchSizeArg = args.find(arg => arg.startsWith('--batch='))
	const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : null

	const isToday = args.includes('--today')

	const dateRangeArg = args.find(arg => arg.startsWith('--date-range='))
	const dateRange = dateRangeArg ? dateRangeArg.split('=')[1] : null

	return { source, startPage, endPage, batchSize, isToday, dateRange }
}

/**
 * Get date range based on CLI arguments
 * 
 * Returns date range object based on parsed CLI flags.
 * 
 * @returns DateRange object with from and to dates
 * 
 * TODO: Implement date range logic
 * - Call parseArgs() to get CLI options
 * - If --today flag: return today's date range
 * - If --date-range flag: parse and validate dates
 * - Default: return yesterday's date range
 * - Handle invalid date formats gracefully
 * - Use UTC dates to avoid timezone issues
 */
export function getDateRange(): DateRange | null {
	const { isToday, dateRange } = parseArgs()
	
	if (dateRange) {
		const [fromStr, toStr] = dateRange.split(',')
		const from = parseDate(fromStr)
		const to = parseDate(toStr)
		if (!from || !to) throw new Error('Invalid date range format')
		return { from, to }
	}
	
	if (isToday) {
		const today = getToday()
		return { from: today, to: today }
	}
	
	return null;
}

/**
 * Format date to yyyy-MM-dd string
 * 
 * @param date - Date object to format
 * @returns Formatted date string
 * 
 * TODO: Implement date formatting
 * - Use UTC methods to avoid timezone issues
 * - Format as yyyy-MM-dd
 * - Pad month and day with zeros
 */
export function formatDate(date: Date): string {
	const year = date.getUTCFullYear()
	const month = String(date.getUTCMonth() + 1).padStart(2, '0')
	const day = String(date.getUTCDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Parse date string in yyyy-MM-dd format
 * 
 * @param dateStr - Date string to parse
 * @returns Date object or null if invalid
 * 
 * TODO: Implement date parsing
 * - Validate format (yyyy-MM-dd)
 * - Parse to Date object
 * - Use UTC to avoid timezone issues
 * - Return null for invalid dates
 */
export function parseDate(dateStr: string): Date | null {
	const regex = /^\d{4}-\d{2}-\d{2}$/
	if (!regex.test(dateStr)) return null
	
	const date = new Date(dateStr + 'T00:00:00.000Z')
	return isNaN(date.getTime()) ? null : date
}

/**
 * Get yesterday's date
 * 
 * @returns Date object for yesterday
 * 
 * TODO: Implement yesterday calculation
 * - Get current date
 * - Subtract one day
 * - Return Date object
 */
export function getYesterday(): Date {
	const date = new Date()
	date.setUTCDate(date.getUTCDate() - 1)
	date.setUTCHours(0, 0, 0, 0)
	return date
}

/**
 * Get today's date at start of day (00:00:00)
 * 
 * @returns Date object for today
 * 
 * TODO: Implement today calculation
 * - Get current date
 * - Set to start of day
 * - Return Date object
 */
export function getToday(): Date {
	const date = new Date()
	date.setUTCHours(0, 0, 0, 0)
	return date
}

