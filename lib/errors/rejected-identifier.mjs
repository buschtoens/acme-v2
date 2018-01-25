import StandardError from './standard';

export default class RejectedIdentifierError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:rejectedIdentifier';
  // static description = 'The server will not issue for the identifier';
}

RejectedIdentifierError.type = 'urn:ietf:params:acme:error:rejectedIdentifier';
RejectedIdentifierError.description =
  'The server will not issue for the identifier';
