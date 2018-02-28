import StandardError from './standard';

export default class UnauthorizedError extends StandardError {
  static type = 'urn:ietf:params:acme:error:unauthorized';
  static description = 'The client lacks sufficient authorization';
}
