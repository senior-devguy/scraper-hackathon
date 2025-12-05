import { ContractTransformer } from '../../base/BaseTransformer'
import { INTAKE_CONTRACT } from '../../schemas/intake.schema'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema'
import { generateAgencyId, generateId, parseFlexibleDate, parseMonetaryValue } from '../../utils/helpers'

export class PennsylvaniaContractTransformer extends ContractTransformer {
	public transform(opportunity: SOURCE_CONTRACT, source: string): INTAKE_CONTRACT {
		return {
			id: generateId(opportunity.id, source),
			externalId: opportunity.id,
			agencyId: generateAgencyId(opportunity.agency, source),
			supplierId: generateAgencyId(opportunity.supplierName ?? opportunity.supplierNumber, source),
			source: source,
			title: opportunity.title || 'Untitled Contract',
			description: opportunity.description,
			publishedAt: parseFlexibleDate(opportunity.beginDate),
			closingAt: parseFlexibleDate(opportunity.endDate),
			status: this.normalizeStatus(opportunity),
			amount: parseMonetaryValue(opportunity.contractAmount),
			category: opportunity.category,
			eventType: opportunity.reasonForChange,
			sourceUrl: null,
			scrapedAt: new Date().toISOString(),
			updatedAt: parseFlexibleDate(opportunity.lastUpdated),
		}
	}

	private normalizeStatus(contract: SOURCE_CONTRACT): string {
		const endDate = parseFlexibleDate(contract.endDate);
		if (endDate != null && (new Date(endDate) < new Date())) return 'closed'
		if (contract.awards != "N/A") return 'awarded'
		return 'open';
	}
}