import { Page } from 'playwright'
import { BaseExtractor } from '../../base/BaseExtractor'
import { SOURCE_CONTRACT } from '../../schemas/PAeMarketplace/source.schema';

export class ContractExtractor extends BaseExtractor<SOURCE_CONTRACT> {
	public async extract(page: Page): Promise<SOURCE_CONTRACT> {

		// Extract basic opportunity information
		const contractNumber = await this.extractText(page.locator('#ctl00_MainBody_lbl_ContractNumber').first());
		const parent = await this.extractText(page.locator('#ctl00_MainBody_lbl_ParentNumber').first());
		const description = await this.extractText(page.locator('#ctl00_MainBody_lbl_Description').first());
		const reasonForChange = await this.extractText(page.locator('#ctl00_MainBody_lbl_ReasonForChange').first());
		const category = await this.extractText(page.locator('#ctl00_MainBody_lbl_Category').first());
		const beginDate = await this.extractText(page.locator('#ctl00_MainBody_lbl_BeginDate').first());
		const endDate = await this.extractText(page.locator('#ctl00_MainBody_lbl_EndingDate').first());
		const execDate = await this.extractText(page.locator('#ctl00_MainBody_lbl_ExecutionDate').first());
		const contractAmount = await this.extractText(page.locator('#ctl00_MainBody_lbl_ContractAmount').first());
		const supplierName = await this.extractText(page.locator('#ctl00_MainBody_lbl_SupplierName').first()); 
		const supplierNumber = await this.extractText(page.locator('#ctl00_MainBody_lbl_SupplierNumber').first());
		const commoditySpecialist = await this.extractText(page.locator('#ctl00_MainBody_lbl_CommoditySpecialist').first()); 
		const agency = await this.extractText(page.locator('#ctl00_MainBody_lbl_Agency').first());
		const lastUpdated = await this.extractText(page.locator('#ctl00_MainBody_lbl_LastUpdated').first());
		const costars = await this.extractText(page.locator('#ctl00_MainBody_lbl_CoStars').first());
		const pcard = await this.extractText(page.locator('#ctl00_MainBody_lbl_PCard').first());

		let solicitations = await this.extractText(page.locator('#ctl00_MainBody_lbl_Solicitations').first());
		if (solicitations != 'N/A') {
			solicitations = 'Yes'
		}
		let tabs = await this.extractText(page.locator('#ctl00_MainBody_lbl_Tabs').first());
		if (tabs != 'N/A') {
			tabs = 'Yes'
		}
		let awards = await this.extractText(page.locator('#ctl00_MainBody_lbl_Awards').first());
		if (awards != 'N/A') {
			awards = 'Yes'
		}

		// Extract status
		let mscc = true;
		const msccSrc = await this.extractAttribute(page.locator('#ctl00_MainBody_ImgUnchecked').first(), 'src');
		if (msccSrc != null) {
			mscc = false;
		}

		if (contractNumber == null) {
			throw Error('Contract number is null');
		};

		return {
			id: contractNumber,
			title: contractNumber,
			parent,
			description,
			reasonForChange,
			category,
			beginDate,
			endDate,
			execDate,
			contractAmount,
			supplierName,
			supplierNumber,
			commoditySpecialist,
			agency,
			lastUpdated,
			costars,
			pcard,
			tabs,
			solicitations,
			awards,
			mscc,
		}
	}
}