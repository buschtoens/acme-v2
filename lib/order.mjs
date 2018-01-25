import { assertIsAccount } from './assertions';

/**
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.3
 */
export default class Order {
  // /**
  //  * The account this instance is associated with.
  //  * @type {Account}
  //  */
  // account;

  // /**
  //  * The URL for this order as provided by the server.
  //  * @type {string}
  //  */
  // orderURL;

  /**
   * @param {Account} account
   * @param {string} orderURL
   * @throws {TypeError}
   */
  constructor(account, orderURL) {
    assertIsAccount(account);
    this.account = account;
    this.orderURL = orderURL;
  }

  static async create(account, { identifiers, notBefore, notAfter }) {
    return account.signedRequest(
      account.acme.directory.newOrder,
      { identifiers, notBefore, notAfter },
      { kid: true }
    );
  }
}
