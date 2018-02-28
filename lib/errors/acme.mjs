/**
 * The base class for wrapping instances of got.HTTPError, i.e. ACME protocol
 *   errors.
 */
export default class ACMEError extends Error {
  // /**
  //  * The original got.HTTPError.
  //  * @type {got.HTTPError}
  //  */
  httpError;

  /**
   * Takes an instance of got.HTTPError and wraps it.
   * @param {got.HTTPError} httpError
   */
  constructor(httpError) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.httpError = httpError;
  }

  /**
   * The name of this error class, e.g. {@link ACMEError}, {@link BadNonceError}
   *   or {@link NonStandardError}.
   * @type {string}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * The error message. Is an alias of detail.
   * @type {string}
   */
  get message() {
    return this.detail;
  }

  /**
   * The full error type of this error as specified in the RFC, if known.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-6.6
   */
  get type() {
    return this.constructor.type;
  }

  /**
   * The detail field, if provided by the server, otherwise the default error
   *   description provided by the error class.
   * @see https://tools.ietf.org/html/rfc7807#section-3
   * @type {string}
   */
  get detail() {
    return this.httpError.response.body.detail || this.constructor.description;
  }

  /**
   * The subproblems, if provided by the server.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-6.6.1
   * @type {Object[]}
   */
  get subproblems() {
    return this.httpError.response.body.subproblems || [];
  }
}
