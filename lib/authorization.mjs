import { assertIsOrder } from './assertions';
import ChallengesList from './challenges-list';
import transformAsClass from './decorators/transform-as-class';

/**
 * @typedef Identifier
 * @type {Object}
 * @param {string} type
 * @param {string} value
 */

/**
 * @typedef Challenge
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-8
 * @type {Object}
 * @param {string} type The type of challenge encoded in the object.
 * @param {string} url The URL to which a response can be posted.
 * @param {string} status The status of this challenge. Possible values are:
 *   "pending", "valid", and "invalid".
 * @param {string} validated The time at which the server this challenge,
 *   encoded in the format specified in RFC 3339. This field is REQUIRED if the
 *   "status" field is "valid".
 * @param {Object} errors Errors that occurred while the server was validating
 *   the challenge, if any, structured as problem documents [RFC7807]. The
 *   server MUST NOT modify the array except by appending entries onto the end.
 *   The server can limit the size of this object by limiting the number of
 *   times it will try to validate a challenge.
 */

/**
 * An ACME authorization object represents a server's authorization for  an
 *   account to represent an identifier. In addition to the  identifier, an
 *   authorization includes several metadata fields, such as the status of the
 *   authorization (e.g., "pending", "valid", or  "revoked") and which
 *   challenges were used to validate possession of  the identifier.
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.4
 */
export default class Authorization {
  /**
   * The order this instance is associated with.
   * @type {Order}
   */
  order;

  /**
   * The identifier that the account is authorized to represent.
   * @type {Identifier}
   */
  identifier = null;

  /**
   * The status of this authorization. Possible values are: "pending",
   *   "processing", "valid", "invalid" and "revoked".
   * @type {string}
   */
  status;

  /**
   * For pending authorizations, the challenges that the client can fulfill in
   *   order to prove possession of the identifier. For final authorizations (in
   *   the "valid" or "invalid" state), the challenges that were used. Each
   *   array entry is an object with parameters required to validate the
   *   challenge. A client should attempt to fulfill one of these challenges,
   *   and a server should consider any one of the challenges sufficient to make
   *   the authorization valid. For final authorizations, it contains the
   *   challenges that were successfully completed.
   * @type {Challenge[]}
   */
  @transformAsClass(ChallengesList, 'inlineData')
  challenges;

  /**
   * The timestamp after which the server will consider this authorization
   *   invalid, encoded in the format specified in RFC 3339.  This field is
   *   REQUIRED for objects with "valid" in the "status" field.
   * @see https://tools.ietf.org/html/rfc3339
   * @type {string}
   */
  expires;

  /**
   * @param {Order} order
   * @throws {TypeError}
   */
  constructor(order) {
    assertIsOrder(order);
    this.order = order;
  }

  static async createFromURL(order, url) {
    const response = await order.account.acme.request(url);

    const authorization = new Authorization(order, url);
    authorization.updateLocalInformation(response);

    return authorization;
  }

  toString() {
    return `Authorization { identifier.value = '${this.identifier.value}' }`;
  }

  /**
   * Updates the information of this instance.
   * @param {got.Response} res
   * @private
   */
  updateLocalInformation({
    headers: { location },
    body: { finalize, authorizations, ...body } = {}
  }) {
    if (location) this.authorizationURL = location;
    if (finalize) this.finalizeURL = finalize;
    Object.assign(this, body);
  }

  /**
   * @param {object} payload
   * @return {Authorization}
   */
  async update(payload) {
    const response = await this.signedRequest(this.authorizationURL, payload, {
      kid: true
    });

    this.updateLocalInformation(response);

    return this;
  }

  /**
   * If a client wishes to relinquish its authorization to issue
   certificates
   *   for an identifier, then it may request that the server
   deactivates
   *   each authorization associated with it by sending POST
   requests with
   *   the static object {"status": "deactivated"} to each
   authorization URL.
   * @return {Promise}
   */
  async deactivate() {
    return this.update({ status: 'deactivated' });
  }
}
