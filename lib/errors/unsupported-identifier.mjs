import StandardError from './standard';

export default class UnsupportedIdentifierError extends StandardError {
  static type = 'urn:ietf:params:acme:error:unsupportedIdentifier';
  static description = 'Identifier is not supported, but may be in future';
}
