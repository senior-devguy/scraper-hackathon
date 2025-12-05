import { AgencyTransformer } from '../../base/BaseTransformer'
import { INTAKE_AGENCY } from '../../schemas/intake.schema'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema'
import { generateAgencyId } from '../../utils/helpers'

export class PennsylvaniaAgencyTransformer extends AgencyTransformer {
	public transform(opportunity: SOURCE_CONTRACT, source: string): INTAKE_AGENCY | null {
		if (!opportunity.agency) return null
		
		return {
			id: generateAgencyId(opportunity.agency, source)!,
			externalId: opportunity.agency,
			source: source,
			name: opportunity.agency,
			type: null,
		}
	}
}