import ACMEError from './acme';

/**
 * If the server send an error of an unknown type, it will be wrapped in this
 *   error class.
 */
export default class NonStandardError extends ACMEError {
  // static type = null;
  // static description = 'A non-standardized protocol error that is not part of the ACME reference RFC';

  /**
   * The error type as provided by the server.
   * @type {string}
   */
  get type() {
    return this.httpError.response.body.type;
  }
}

NonStandardError.type = null;
NonStandardError.description =
  'A non-standardized protocol error that is not part of the ACME reference RFC';
