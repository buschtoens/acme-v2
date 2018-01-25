import StandardError from './standard';

export default class MalformedError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:malformed';
  // static description = 'The request message was malformed';
}

MalformedError.type = 'urn:ietf:params:acme:error:malformed';
MalformedError.description = 'The request message was malformed';
