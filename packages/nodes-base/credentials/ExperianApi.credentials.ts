import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class ExperianApi implements ICredentialType {
	name = 'experianApi';
	displayName = 'Experian API';
	properties = [
		{
			displayName: 'Host URL',
			name: 'url',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true
		},
		{
			displayName: 'Product',
			name: 'product',
			type: 'options' as NodePropertyTypes,
			options: [
				{
					name: 'Prequalification Credit Report',
					value: '/consumerservices/prequal/v1/credit-report',
				},
				{
					name: 'Prequalification Credit Score',
					value: '/consumerservices/prequal/v1/credit-score',
				},
			],
			default: 'Prequalification Credit Report',
			description: 'Prequalification',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
			required: true
		},
		{
			displayName: 'Client Id',
			name: 'clientId',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
			required: true
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
			required: true
		},
		{
			displayName: 'Client Reference Id',
			name: 'clientReferenceId',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true
		},
		{
			displayName: 'Subscriber Code',
			name: 'subscriberCode',
			type: 'string' as NodePropertyTypes,
			default: '',
			required: true
		},
	];
}
