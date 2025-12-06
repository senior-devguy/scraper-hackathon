import { AwardTransformer } from '../../base/BaseTransformer'
import { INTAKE_AWARD } from '../../schemas/intake.schema'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema'
import { generateAgencyId, generateAwardId, parseFlexibleDate, parseMonetaryValue } from '../../utils/helpers'

export class PennsylvaniaAwardTransformer extends AwardTransformer {
	public transform(opportunity: SOURCE_CONTRACT, contractId: string, source: string): INTAKE_AWARD | null {
		if (!opportunity.awards) {
			return null
		}
		
		return {
			id: generateAwardId(opportunity.awards.sourceUrl ?? contractId, source),
			contractId: contractId,
			source: source,
			agencyId: generateAgencyId(opportunity.awards.agency, source),
			awardedToId: generateAgencyId(opportunity.awards.awardedTo, source),
			description: opportunity.awards.description,
			amount: parseMonetaryValue(opportunity.awards.dollarAmount),
			updatedAt: parseFlexibleDate(opportunity.awards.postedDate),
			sourceUrl: opportunity.awards.sourceUrl ?? '',
		}
	}
}