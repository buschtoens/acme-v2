import { assertIsOrder } from './assertions';
import Authorization from './authorization';

/**
 * @external {Iterator} https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator
 */

/**
 * An `AuthorizationsList` is an {@link Iterator} that yields all authorizations
 *    belonging to the associated instance of {@link Order}.
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.3
 */
export default class AuthorizationsList {
  /**
   * The order this instance is associated with.
   * @type {Order}
   */
  order;

  /**
   * The URLs for all authorizations.
   * @type {String[]}
   */
  urls = [];

  /**
   * @param {Order} order
   * @throws {TypeError}
   */
  constructor(order) {
    assertIsOrder(order);
    this.order = order;
  }

  /**
   * Loads all authorizations of this AuthorizationsList.
   * @yields {Authorization}
   */
  *[Symbol.iterator]() {
    for (const authorizationURL of this.urls) {
      yield Authorization.createFromURL(this.order, authorizationURL);
    }
  }
}
