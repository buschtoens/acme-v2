import StandardError from './standard';

export default class UnsupportedContactError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:unsupportedContact';
  // static description = 'A contact URL for an account used an unsupported protocol scheme';
}

UnsupportedContactError.type = 'urn:ietf:params:acme:error:unsupportedContact';
UnsupportedContactError.description =
  'A contact URL for an account used an unsupported protocol scheme';
