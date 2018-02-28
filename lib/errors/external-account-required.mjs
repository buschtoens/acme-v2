import StandardError from './standard';

export default class ExternalAccountRequiredError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:externalAccountRequired';
  // static description = 'The request must include a value for the "externalAccountBinding" field';
}

ExternalAccountRequiredError.type =
  'urn:ietf:params:acme:error:externalAccountRequired';
ExternalAccountRequiredError.description =
  'The request must include a value for the "externalAccountBinding" field';
