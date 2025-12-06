import { PeopleTransformer } from '../../base/BaseTransformer'
import { INTAKE_PEOPLE } from '../../schemas/intake.schema'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema'
import { generatePersonId } from '../../utils/helpers'

export class PennsylvaniaPeopleTransformer extends PeopleTransformer {
	public transform(opportunity: SOURCE_CONTRACT, contractId: string, source: string): INTAKE_PEOPLE | null {
		if (!opportunity.commoditySpecialist) {
			return null
		}
		
		return {
			id: generatePersonId(opportunity.commoditySpecialist, source),
			contractId: contractId,
			source: source,
			name: opportunity.commoditySpecialist || 'Unknown Contact',
			email: null,
			phone: null,
			role: 'Commodity Specialist',
		}
	}
}