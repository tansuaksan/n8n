import {IExecuteSingleFunctions} from 'n8n-core';
import {INodeExecutionData, INodeType, INodeTypeDescription,} from 'n8n-workflow';

export class ExperianParser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Experian Credit Report Parser',
		name: 'experianParser',
		icon: 'file:experian.png',
		group: ['transform'],
		version: 1,
		description: 'Parse Experian Credit Report response.',
		defaults: {
			name: 'Experian Credit Report Parser',
			color: '#ddbb33',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [],
	};

	async executeSingle(this: IExecuteSingleFunctions): Promise<INodeExecutionData> {
		let item = this.getInputData();

		item = JSON.parse(JSON.stringify(item));

		let response = {};

		const creditProfiles = item.json["creditProfile"] as object[];

		if (creditProfiles.length > 0) {

			const creditProfile = creditProfiles[0] as object;

			// @ts-ignore
			const informationalMessages = (creditProfile["informationalMessage"] as object[]);

			let noRecord = false;

			informationalMessages.forEach((value) => {
				// @ts-ignore
				if (value["messageNumber"] as string === "07") {
					noRecord = true;
				}
			});


			// @ts-ignore
			const tradeline = creditProfile["tradeline"] as object[];

			let tradelineCount;

			if (tradeline !== undefined) {
				tradelineCount = tradeline.length;
			}

			// @ts-ignore
			const summaries = (creditProfile["summaries"] as object[]);

			const profileSummary = {};

			if (summaries !== undefined && summaries.length > 0) {
				const summary = summaries[0];

				// @ts-ignore
				if (summary["summaryType"] === "Profile Summary") {

					// @ts-ignore
					const attributes = summary["attributes"] as object[];

					attributes.forEach((value) => {
						// @ts-ignore
						const id = value["id"] as string;
						if (id === "oldestTradeDate" || id.includes("Flag")) {
							// @ts-ignore
							// tslint:disable-next-line:radix
							profileSummary[(value["id"] as string)] = value["value"] as string;
						} else {
							// @ts-ignore
							// tslint:disable-next-line:radix
							profileSummary[(value["id"] as string)] = parseInt(value["value"] as string);
						}
					});
				}
			}

			const riskModel = {};

			// @ts-ignore
			const riskModels = (creditProfile["riskModel"] as object[]);

			if (riskModels !== undefined) {
				riskModels.forEach((value) => {
					// @ts-ignore
					const modelIndicator = value["modelIndicator"] as string;
					// @ts-ignore
					// tslint:disable-next-line:radix
					riskModel[modelIndicator] = parseInt(value["score"] as string);

				});
			}

			let isBankruptIn90Days;

			// @ts-ignore
			const publicRecords = (creditProfile["publicRecord"] as object[]);

			if (publicRecords !== undefined) {

				const filingDates: Date[] = [];

				publicRecords.forEach(value => {
					// @ts-ignore
					const bankruptcyAssetAmount = value["bankruptcyAssetAmount"] as string;

					if (bankruptcyAssetAmount !== undefined) {
						// @ts-ignore
						const filingDate = value["filingDate"] as string;

						// tslint:disable-next-line:radix
						filingDates.push(new Date(parseInt(filingDate.substr(4, 4)), parseInt(filingDate.substr(0, 2)), parseInt(filingDate.substr(2, 2))));
					}
				});

				// @ts-ignore
				isBankruptIn90Days = filingDates.some(value => {
					// @ts-ignore
					return value > new Date(new Date() - (1000 * 60 * 60 * 24 * 90));
				});
			}

			response = {
				"noRecord": noRecord,
				"tradelineCount": tradelineCount,
				"isBankruptIn90Days": isBankruptIn90Days,
				"profileSummary": profileSummary,
				"riskModel": riskModel
			};
		}

		return {
			json: response
		};
	}
}
