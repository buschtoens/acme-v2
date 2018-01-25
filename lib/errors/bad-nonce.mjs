import StandardError from './standard';

export default class BadNonceError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:badNonce';
  // static description = 'The client sent an unacceptable anti-replay none';
}

BadNonceError.type = 'urn:ietf:params:acme:error:badCSR';
BadNonceError.description = 'The client sent an unacceptable anti-replay none';
