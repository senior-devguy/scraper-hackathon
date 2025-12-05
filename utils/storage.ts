import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Storage Utilities
 * 
 * Handle local file system operations for saving scraped data.
 * 
 * File structure:
 * ./output/
 *   source/
 *     session_SOURCE_YYYY-MM-DD_TIMESTAMP/
 *       batch_1.json
 *       batch_2.json
 *       ...
 *   intake/
 *     intake_SOURCE_YYYY-MM-DD_TIMESTAMP.json
 *   documents/
 *     CONTRACT_ID/
 *       document1.pdf
 *       document2.xlsx
 *       ...
 */

/**
 * Create session directory for this scraping run
 * 
 * @param sessionName - Unique session directory name
 * @param stage - Either 'source' or 'intake'
 * @returns Full path to created directory
 * 
 * TODO: Implement directory creation
 * - Build path: ./output/{stage}/{sessionName}/
 * - Create directory recursively (mkdir -p)
 * - Return full path
 * - Handle errors gracefully
 */
export async function createSessionDirectory(
	sessionName: string,
	stage: 'source' | 'intake'
): Promise<string> {
	const dirPath = path.join('./output', stage, sessionName)
	await fs.mkdir(dirPath, { recursive: true })
	return dirPath
}

/**
 * Save batch data to JSON file
 * 
 * @param data - Data object to save (must match SOURCE_TO_INTAKE schema)
 * @param sessionDir - Session directory path
 * @param batchNum - Batch number (for filename)
 * 
 * TODO: Implement batch saving
 * - Build filename: batch_{batchNum}.json
 * - Convert data to JSON string (pretty-printed with 2 spaces)
 * - Write to file
 * - Log success message
 * - Handle write errors
 */
export async function saveBatchToFile(
	data: any,
	sessionDir: string,
	batchNum: number
): Promise<void> {
	const fileName = `batch_${batchNum}.json`
	const filePath = path.join(sessionDir, fileName)
	await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

/**
 * Save intake output to JSON file
 * 
 * @param data - Intake data object (must match INTAKE_OUTPUT schema)
 * @param fileName - Output file name
 * 
 * TODO: Implement intake saving
 * - Create intake directory if not exists
 * - Build path: ./output/intake/{fileName}.json
 * - Convert data to JSON string (pretty-printed)
 * - Write to file
 * - Log success message
 */
export async function saveIntakeToFile(data: any, sessionDir: string, fileName: string): Promise<string> {
	const intakeDir = `./output/intake/${sessionDir}`
	await fs.mkdir(intakeDir, { recursive: true })
	const filePath = path.join(intakeDir, `${fileName}.json`)
	await fs.writeFile(filePath, JSON.stringify(data, null, 2))
	return filePath;
}

/**
 * Download file from URL and save locally
 * 
 * @param url - URL to download from
 * @param contractId - Contract ID (for organizing files)
 * @param fileName - File name to save as
 * @returns Local file path where file was saved
 * 
 * TODO: Implement file download
 * - Create documents directory structure: ./output/documents/{contractId}/
 * - Download file from URL (use fetch or Playwright)
 * - Save to local path
 * - Return local file path
 * - Handle download errors gracefully
 */
export async function downloadFileLocally(
	url: string,
	contractId: string,
	fileName: string
): Promise<{ localPath: string; fileSize: number }> {
	const docDir = path.join('./output/documents', contractId)
	await fs.mkdir(docDir, { recursive: true })
	const filePath = path.join(docDir, fileName)
	
	try {
		const response = await fetch(url)
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		const buffer = await response.arrayBuffer()
		await fs.writeFile(filePath, Buffer.from(buffer))
		
		return {
			localPath: filePath,
			fileSize: buffer.byteLength
		}
	} catch (error) {
		throw error
	}
}

/**
 * Read all batch files from a session directory
 * 
 * @param sessionDir - Session directory path
 * @returns Array of parsed batch data objects
 * 
 * TODO: Implement batch reading
 * - List all files in session directory
 * - Filter for batch_*.json files
 * - Read and parse each file
 * - Return array of parsed objects
 * - Handle read/parse errors
 */
export async function readBatchFiles(sessionDir: string): Promise<any[]> {
	const files = await fs.readdir(sessionDir)
	const batchFiles = files.filter(f => f.startsWith('batch_') && f.endsWith('.json'))
	
	const batches = []
	for (const file of batchFiles) {
		try {
			const content = await fs.readFile(path.join(sessionDir, file), 'utf-8')
			batches.push(JSON.parse(content))
		} catch (error) {
			console.error(`Failed to read ${file}:`, error)
		}
	}
	return batches
}

/**
 * Generate unique session name
 * 
 * @param source - Source name (e.g., 'yourstate')
 * @param filter - Date range or Page Range being scraped 
 * @returns Unique session name
 * 
 * Format: session_SOURCE_YYYY-MM-DD_TIMESTAMP
 * Example: session_georgia_2024-01-15_1705334400000
 * 
 * TODO: Implement session name generation
 * - Format date as YYYY-MM-DD
 * - Get current timestamp
 * - Combine into session name
 */
export function generateSessionName(
	source: string,
	filter: string
): string {
	const timestamp = Date.now()
	return `session_${source}_${filter}_${timestamp}`
}

/**
 * Check if directory exists
 * 
 * @param dirPath - Directory path to check
 * @returns True if directory exists
 * 
 * TODO: Implement directory existence check
 * - Use fs.access or fs.stat
 * - Return true if exists, false otherwise
 * - Handle errors gracefully
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		await fs.access(dirPath)
		return true
	} catch {
		return false
	}
}

