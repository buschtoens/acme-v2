import StandardError from './standard';

export default class TLSError extends StandardError {
  static type = 'urn:ietf:params:acme:error:incorrectResponse';
  static description = "Response received didn't match the challenge's requirements";
}
