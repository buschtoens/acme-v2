import StandardError from './standard';

export default class InvalidContactError extends StandardError {
  static type = 'urn:ietf:params:acme:error:invalidContact';
  static description = 'A contact URL for an account was invalid';
}
