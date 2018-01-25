import StandardError from './standard';

export default class BadRevocationReasonError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:badRevocationReason';
  // static description = 'The revocation reason provided is not allowed by the server';
}

BadRevocationReasonError.type = 'urn:ietf:params:acme:error:badRevocationReason';
BadRevocationReasonError.description =
  'The revocation reason provided is not allowed by the server';
