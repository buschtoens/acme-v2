import StandardError from './standard';

export default class CAAError extends StandardError {
  static type = 'urn:ietf:params:acme:error:caa';
  static description = 'Certification Authority Authorization (CAA) records forbid the CA from issuing';
}
