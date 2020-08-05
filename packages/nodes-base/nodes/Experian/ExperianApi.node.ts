import {
	IExecuteFunctions,
} from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {OptionsWithUri} from 'request';

export class ExperianApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Experian API',
		name: 'experianApi',
		icon: 'file:experian.png',
		group: ['transform'],
		version: 1,
		description: 'Interacts with Experian API',
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
				displayName: 'Host Url',
				name: 'hostUrl',
				type: 'string',
				default: '',
				description: 'Host Url',
				required: true,
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				description: 'Request Body',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				required: true,
			}
		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let response: any; // tslint:disable-line:no-any
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const experianApiCredentials = this.getCredentials('experianApi');

			const hostUrl = this.getNodeParameter('hostUrl', itemIndex) as string;
			const body = this.getNodeParameter('body', itemIndex) as string;

			const accessTokenRequestOptions: OptionsWithUri = {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Grant_type': 'password'
				},
				method: 'POST',
				uri: `${hostUrl}/oauth2/v1/token`,
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
					uri: `${hostUrl}/consumerservices/credit-profile/v1/extended-view-score`,
					auth: {
						bearer: response!.access_token
					},
					json: JSON.parse(body)
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
