import StandardError from './standard';

export default class BadSignatureAlgorithmError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:badSignatureAlgorithm';
  // static description = 'The JWS was signed with an algorithm the server does not support';
}

BadSignatureAlgorithmError.type = 'urn:ietf:params:acme:error:badSignatureAlgorithm';
BadSignatureAlgorithmError.description =
  'The JWS was signed with an algorithm the server does not support';
