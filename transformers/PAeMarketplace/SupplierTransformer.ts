import { AgencyTransformer } from '../../base/BaseTransformer'
import { INTAKE_AGENCY } from '../../schemas/intake.schema'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema'
import { generateAgencyId } from '../../utils/helpers'

export class PennsylvaniaSupplierTransformer extends AgencyTransformer {
	public transform(opportunity: SOURCE_CONTRACT, source: string): INTAKE_AGENCY | null {
		if (!generateAgencyId(opportunity.supplierName ?? opportunity.supplierNumber, source)) return null
		
		return {
			id: generateAgencyId(opportunity.supplierName ?? opportunity.supplierNumber, source)!,
			externalId: (opportunity.supplierNumber ?? opportunity.supplierName) || '',
			source: source,
			name: (opportunity.supplierName ?? opportunity.supplierNumber) || '',
			type: null,
		}
	}
}