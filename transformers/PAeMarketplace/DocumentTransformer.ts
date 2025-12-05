import { DocumentTransformer } from '../../base/BaseTransformer'
import { INTAKE_DOCUMENT } from '../../schemas/intake.schema'
import { SOURCE_DOCUMENT } from '../../schemas/PAeMarketplace/source.schema'
import { generateDocumentId } from '../../utils/helpers'

export class PennsylvaniaDocumentTransformer extends DocumentTransformer {
	public transform(document: SOURCE_DOCUMENT, contractId: string, source: string): INTAKE_DOCUMENT {
		return {
			id: generateDocumentId(document.title, source),
			contractId: contractId,
			source: document.downloadUrl,
			fileName: document.fileName,
			fileType: document.fileType ?? 'unknown',
			fileSize: document.fileSize,
			fileUrl: document.localPath,
			uploadedAt: new Date().toISOString(),
		}
	}
}