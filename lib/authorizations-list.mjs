import { assertIsAccount } from './assertions';
import Authorization from './authorization';

/**
 * @external {Iterator} https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator
 */

/**
 * An `AuthorizationsList` is an {@link Iterator} that yields all authorizations
 *    belonging to the associated instance of {@link Account}.
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.3
 */
export default class AuthorizationsList {
  // /**
  //  * The account this instance is associated with.
  //  * @type {Account}
  //  */
  // account;

  /**
   * @param {Account} account
   * @throws {TypeError}
   */
  constructor(account) {
    assertIsAccount(account);
    this.account = account;
  }

  /**
   * Alias for `this.account.authorizationURLs`.
   * @type {string}
   */
  get authorizationURLs() {
    return this.account.authorizationURLs;
  }

  /**
   * Loads all authorizations of this AuthorizationsList.
   * @yields {Authorization}
   */
  *[Symbol.Iterator]() {
    for (const authorizationURL of this.authorizationURLs) {
      yield Authorization.createFromURL(this.account, authorizationURL);
    }
  }
}
