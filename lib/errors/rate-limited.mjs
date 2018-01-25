import StandardError from './standard';

export default class RateLimitedError extends StandardError {
  // static type = 'urn:ietf:params:acme:error:rateLimited';
  // static description = 'The request exceeds a rate limit';
}

RateLimitedError.type = 'urn:ietf:params:acme:error:rateLimited';
RateLimitedError.description = 'The request exceeds a rate limit';
