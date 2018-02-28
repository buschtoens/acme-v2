import StandardError from './standard';

export default class UserActionRequiredError extends StandardError {
  static type = 'urn:ietf:params:acme:error:userActionRequired';
  static description = 'Visit the "instance" URL and take actions specified there';
}
