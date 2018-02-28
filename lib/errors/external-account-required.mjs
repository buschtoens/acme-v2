import StandardError from './standard';

export default class ExternalAccountRequiredError extends StandardError {
  static type = 'urn:ietf:params:acme:error:externalAccountRequired';
  static description = 'The request must include a value for the "externalAccountBinding" field';
}
