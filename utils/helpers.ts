import * as crypto from 'crypto'

/**
 * Helper Utilities
 * 
 * Common utility functions used throughout the scraper and intake.
 */

/**
 * Generate deterministic ID from string
 * 
 * Creates a unique, deterministic ID by hashing the input string.
 * Same input always produces same output.
 * 
 * @param input - Input string to hash
 * @param prefix - Optional prefix for the ID
 * @returns Deterministic ID
 * 
 * TODO: Implement ID generation
 * - Use crypto.createHash('sha256')
 * - Hash the input string
 * - Take first 16 characters of hex digest
 * - Add prefix if provided
 * - Return formatted ID
 * 
 * Example: generateId('GA-2024-001', 'contract') => 'contract-a1b2c3d4e5f6g7h8'
 */
export function generateId(input: string, prefix?: string): string {
	const hash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 16)
	return prefix ? `${prefix.split(' ').join('_')}-${hash}` : hash
}

/**
 * Delay execution for specified milliseconds
 * 
 * Use this to be polite to target servers (rate limiting).
 * 
 * @param ms - Milliseconds to delay
 * 
 * TODO: Implement delay
 * - Return a Promise that resolves after ms milliseconds
 * - Use setTimeout
 */
export async function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clean and normalize text
 * 
 * Removes extra whitespace, trims, and normalizes text.
 * 
 * @param text - Text to clean
 * @returns Cleaned text or null if empty
 * 
 * TODO: Implement text cleaning
 * - Trim whitespace
 * - Replace multiple spaces with single space
 * - Replace newlines with spaces
 * - Return null if empty after cleaning
 */
export function cleanText(text: string | null | undefined): string | null {
	if (!text) return null
	const cleaned = text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ')
	return cleaned || null
}

/**
 * Sanitize filename
 * 
 * Removes or replaces characters that are invalid in filenames.
 * 
 * @param fileName - Original filename
 * @returns Sanitized filename
 * 
 * TODO: Implement filename sanitization
 * - Replace invalid characters (/, \, :, *, ?, ", <, >, |) with underscore
 * - Trim whitespace
 * - Limit length if needed
 * - Ensure valid extension remains intact
 */
export function sanitizeFileName(fileName: string): string {
	return fileName.trim().replace(/[/\\:*?"<>|]/g, '_')
}

/**
 * Extract filename from url
 * 
 * Extract filename only from url
 * 
 */
export function getFilenameFromUrl(url: string): string | null {
  const u = new URL(url);
  const fileParam = u.searchParams.get("file");
  if (!fileParam) return null;

  // Normalize backslashes to forward slashes
  const normalized = fileParam.replace(/\\/g, "/");

  return normalized.split("/").pop() || null;
}

/**
 * Parse date string to Date object
 * 
 * Handles various date formats commonly found in procurement sites.
 * 
 * @param dateStr - Date string in various formats
 * @returns Date object or null if invalid
 * 
 * TODO: Implement date parsing
 * - Try parsing common formats:
 *   - ISO: 2024-01-15
 *   - US: 01/15/2024
 *   - Text: Jan 15, 2024
 *   - With time: Jan 15, 2024 @ 05:00 PM ET
 * - Return Date object if successful
 * - Return null if unable to parse
 * - Handle timezone indicators if present
 */
export function parseFlexibleDate(dateStr: string | null): Date | null {
	if (!dateStr) return null
	
	// Clean the string
	const cleaned = dateStr.replace(/@.*$/, '').trim()
	
	// Try ISO format first
	let date = new Date(cleaned)
	if (!isNaN(date.getTime())) return date
	
	// Try US format MM/DD/YYYY
	const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
	if (usMatch) {
		date = new Date(`${usMatch[3]}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`)
		if (!isNaN(date.getTime())) return date
	}
	
	return null
}

/**
 * Extract monetary value from string
 * 
 * Parses monetary amounts from text.
 * 
 * @param text - Text containing monetary value
 * @returns Numeric value or null
 * 
 * TODO: Implement monetary parsing
 * - Remove currency symbols ($, etc.)
 * - Remove commas
 * - Parse to float
 * - Handle ranges (take first value)
 * - Return null if unable to parse
 * 
 * Examples:
 * - "$1,000.00" => 1000
 * - "$500K" => 500000
 * - "$1M - $5M" => 1000000
 */
export function parseMonetaryValue(text: string | null): number | null {
	if (!text) return null
	
	// Remove currency symbols and clean
	const cleaned = text.replace(/[$,]/g, '').trim()
	
	// Handle K/M suffixes
	if (cleaned.endsWith('K')) {
		const num = parseFloat(cleaned.slice(0, -1))
		return isNaN(num) ? null : num * 1000
	}
	if (cleaned.endsWith('M')) {
		const num = parseFloat(cleaned.slice(0, -1))
		return isNaN(num) ? null : num * 1000000
	}
	
	// Handle ranges (take first value)
	const rangeMatch = cleaned.match(/^([\d.]+)/)
	if (rangeMatch) {
		const num = parseFloat(rangeMatch[1])
		return isNaN(num) ? null : num
	}
	
	return null
}

/**
 * Deduplicate array of objects by key
 * 
 * Removes duplicate objects based on a unique key.
 * 
 * @param items - Array of objects
 * @param keyFn - Function to extract unique key from object
 * @returns Deduplicated array
 * 
 * TODO: Implement deduplication
 * - Use Map or Set to track seen keys
 * - Iterate through items
 * - Keep only first occurrence of each key
 * - Return deduplicated array
 */
export function deduplicateBy<T>(items: T[], keyFn: (item: T) => string): T[] {
	const seen = new Set<string>()
	return items.filter(item => {
		const key = keyFn(item)
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

/**
 * Retry async function with exponential backoff
 * 
 * Retries a function if it fails, with increasing delays between attempts.
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param initialDelay - Initial delay in ms (doubles each retry)
 * @returns Result of the function
 * 
 * TODO: Implement retry logic
 * - Try executing function
 * - If it fails, wait and retry
 * - Double delay after each attempt
 * - Throw error if all retries exhausted
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	initialDelay: number = 1000
): Promise<T> {
	let lastError: Error
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error
			if (attempt < maxRetries) {
				await delay(initialDelay * Math.pow(2, attempt))
			}
		}
	}
	
	throw lastError!
}

/**
 * Log message with timestamp
 * 
 * @param source - Source/module name
 * @param message - Log message
 * @param level - Log level ('info', 'warn', 'error')
 * 
 * TODO: Implement logging
 * - Get current timestamp
 * - Format: [TIMESTAMP] [SOURCE] [LEVEL] message
 * - Use console.log/warn/error based on level
 */
export function log(
	source: string,
	message: string,
	level: 'info' | 'warn' | 'error' = 'info'
): void {
	const timestamp = new Date().toISOString()
	const logMessage = `[${timestamp}] [${source}] [${level.toUpperCase()}] ${message}`
	
	switch (level) {
		case 'warn':
			console.warn(logMessage)
			break
		case 'error':
			console.error(logMessage)
			break
		default:
			console.log(logMessage)
	}
}

