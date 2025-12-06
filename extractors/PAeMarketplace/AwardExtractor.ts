import { Page } from 'playwright'
import { BaseExtractor } from '../../base/BaseExtractor'
import { SOURCE_AWARD } from '../../schemas/PAeMarketplace/source.schema';

export class AwardExtractor extends BaseExtractor<SOURCE_AWARD> {
	public async extractAwardsDetailsLink(page: Page): Promise<string | null> {
		let awardRecordId = await this.extractText(page.locator('span[id$="_lnkAward_Span"]').first());
 
		if (awardRecordId == null) {
			return null;
		}
		awardRecordId = awardRecordId.trim();
		return awardRecordId;
	}

	public async extract(page: Page): Promise<SOURCE_AWARD> {
		// Extract basic award information
		const contractNumber = await this.extractText(page.locator('#ctl00_MainBody_lbl_ContractNumber').first());
		const bidNumber = await this.extractText(page.locator('#ctl00_MainBody_lbl_Bid').first());
		const description = await this.extractText(page.locator('#ctl00_MainBody_lbl_Description').first());
		const agency = await this.extractText(page.locator('#ctl00_MainBody_lbl_Agency').first());
		const awardedTo = await this.extractText(page.locator('#ctl00_MainBody_lbl_AwardedTo').first());
		const dollarAmount = await this.extractText(page.locator('#ctl00_MainBody_lbl_DollarAmount').first());
 
		return {
			contractNumber,
			bidNumber,
			description,
			agency,
			awardedTo,
			dollarAmount,
		}
	}
}