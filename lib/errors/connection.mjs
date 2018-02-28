import StandardError from './standard';

export default class ConnectionError extends StandardError {
  static type = 'urn:ietf:params:acme:error:connection';
  static description = 'The server could not connect to validation target';
}
