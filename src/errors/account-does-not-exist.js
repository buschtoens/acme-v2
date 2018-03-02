import StandardError from './standard';

export default class AccountDoesNotExistError extends StandardError {
  static type = 'urn:ietf:params:acme:error:accountDoesNotExist';
  static description = 'The request specified an account that does not exist';
}
