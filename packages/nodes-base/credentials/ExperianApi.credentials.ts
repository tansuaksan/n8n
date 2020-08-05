import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class ExperianApi implements ICredentialType {
	name = 'experianApi';
	displayName = 'Experian API';
	properties = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Client Id',
			name: 'clientId',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Client Reference Id',
			name: 'clientReferenceId',
			type: 'string' as NodePropertyTypes,
			default: '',
		}
	];
}
