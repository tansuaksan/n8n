import {IExecuteFunctions,} from 'n8n-core';
import {INodeExecutionData, INodeType, INodeTypeDescription,} from 'n8n-workflow';

import {OptionsWithUri} from 'request';

export class ExperianApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Experian API',
		name: 'experianApi',
		icon: 'file:experian.png',
		group: ['transform'],
		version: 1,
		description: 'Experian API',
		defaults: {
			name: 'Experian API',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'experianApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'First Name',
				required: true,
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Last Name',
				required: true,
			},
			{
				displayName: 'Date of Birth',
				name: 'dob',
				type: 'string',
				default: '',
				description: 'It must be 4 (YYYY) or 8 (MMDDYYYY) digits',
				required: true,
			},
			{
				displayName: 'SSN',
				name: 'ssn',
				type: 'string',
				default: '',
				description: 'Social Security Number 11 digits, or 9 digits, or last 4 digits',
				required: true,
			},
			{
				displayName: 'Address Line1',
				name: 'addressLine1',
				type: 'string',
				default: '',
				description: 'Address Line1',
				required: true,
			},
			{
				displayName: 'Address Line2',
				name: 'addressLine2',
				type: 'string',
				default: '',
				description: 'Address Line2'
			},
			{
				displayName: 'Address City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City',
				required: true,
			},
			{
				displayName: 'Address State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'State',
				required: true,
			},
			{
				displayName: 'Address ZIP Code',
				name: 'zipCode',
				type: 'string',
				default: '',
				description: 'ZIP Code',
				required: true,
			},
		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let response: any; // tslint:disable-line:no-any
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const experianApiCredentials = this.getCredentials('experianApi');

			const firstName = this.getNodeParameter('firstName', itemIndex) as string;
			const lastName = this.getNodeParameter('lastName', itemIndex) as string;
			const dob = this.getNodeParameter('dob', itemIndex) as string;
			const ssn = this.getNodeParameter('ssn', itemIndex) as string;
			const addressLine1 = this.getNodeParameter('addressLine1', itemIndex) as string;
			const addressLine2 = this.getNodeParameter('addressLine2', itemIndex) as string;
			const city = this.getNodeParameter('city', itemIndex) as string;
			const state = this.getNodeParameter('state', itemIndex) as string;
			const zipCode = this.getNodeParameter('zipCode', itemIndex) as string;

			const body = {
				"consumerPii": {
					"primaryApplicant": {
						"name": {
							"lastName": lastName,
							"firstName": firstName,
						},
						"dob": {
							"dob": dob
						},
						"ssn": {
							"ssn": ssn
						},
						"currentAddress": {
							"line1": addressLine1,
							"line2": addressLine2,
							"city": city,
							"state": state,
							"zipCode": zipCode
						}
					}
				},
				"permissiblePurpose": {
					"type": "3F"
				},
				"requestor": {
					"subscriberCode": experianApiCredentials!.subscriberCode
				},
				"addOns": {
					"riskModels": {
						"modelIndicator": [
							"V4",
							"D1",
							"II"
						]
					},
					"summaries": {
						"summaryType": [
							"Profile Summary"
						]
					}
				}
			};

			const accessTokenRequestOptions: OptionsWithUri = {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Grant_type': 'password'
				},
				method: 'POST',
				uri: `${experianApiCredentials!.url}/oauth2/v1/token`,
				json: {
					username: experianApiCredentials!.username,
					password: experianApiCredentials!.password,
					client_id: experianApiCredentials!.clientId,
					client_secret: experianApiCredentials!.clientSecret,
				}
			};

			try {
				response = await this.helpers.request(accessTokenRequestOptions);

				const requestOptions: OptionsWithUri = {
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'clientReferenceId': experianApiCredentials!.clientReferenceId
					},
					method: 'POST',
					uri: `${experianApiCredentials!.url}/${experianApiCredentials!.product}`,
					auth: {
						bearer: response!.access_token
					},
					json: body
				};

				response = await this.helpers.request(requestOptions);

			} catch (error) {
				if (this.continueOnFail() === false) {
					throw error;
				}

				let errorItem;
				if (error.response !== undefined) {
					const experianApiErrors = error.response.body?.error ?? {};

					errorItem = {
						statusCode: error.statusCode,
						...experianApiErrors,
						headers: error.response.headers,
					};
				} else {
					errorItem = error;
				}
				returnItems.push({json: {...errorItem}});

				continue;
			}

			if (typeof response === 'string') {
				if (this.continueOnFail() === false) {
					throw new Error('Response body is not valid JSON.');
				}

				returnItems.push({json: {message: response}});
				continue;
			}

			returnItems.push({json: response});
		}


		return [returnItems];
	}
}
