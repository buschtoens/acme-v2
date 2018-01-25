import { assertIsAccount } from './assertions';

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
  // /**
  //  * The account this instance is associated with.
  //  * @type {Account}
  //  */
  // account;

  // /**
  //  * The identifier that the account is authorized to represent.
  //  * @type {Identifier}
  //  */
  // identifier = null;

  // /**
  //  * The status of this authorization. Possible values are: "pending",
  //  *   "processing", "valid", "invalid" and "revoked".
  //  * @type {string}
  //  */
  // status;

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
   * @param {Account} account
   * @throws {TypeError}
   */
  constructor(account) {
    assertIsAccount(account);
    this.account = account;
  }
}
