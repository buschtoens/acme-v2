import StandardError from './standard';

export default class TLSError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:tls';
  // static description = 'The server received a TLS error during validation';
}

TLSError.type = 'urn:ietf:params:acme:error:tls';
TLSError.description = 'The server received a TLS error during validation';
