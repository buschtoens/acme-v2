import StandardError from './standard';

export default class DNSError extends StandardError {
  static type = 'urn:ietf:params:acme:error:dns';
  static description = 'There was a problem with a DNS query';
}
