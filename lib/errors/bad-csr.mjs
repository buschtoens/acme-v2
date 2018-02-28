import StandardError from './standard';

export default class BadCSRError extends StandardError {
  static type = 'urn:ietf:params:acme:error:badCSR';
  static description = 'The CSR is unacceptable (e.g., due to a short key)';
}
