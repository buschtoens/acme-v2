import LinkHeader from 'http-link-header';
import { assertIsAccount } from './assertions';
import Order from './order';

/**
 * @typedef {Object} OrdersListPage
 * @property {string[]} orderURLs
 * @property {string|null} nextURL
 */

/**
 * @external {AsyncIterator} https://github.com/tc39/proposal-async-iteration
 */

/**
 * An `OrdersList` is an {@link AsyncIterator} that yields all orders belonging
 *   to the associated instance of {@link Account}.
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.2.1
 */
export default class OrdersList {
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
   * Alias for `this.account.ordersURL`.
   * @type {string}
   */
  get ordersURL() {
    return this.account.ordersURL;
  }

  /**
   * Loads all orders of this OrdersList.
   * @yields {Order}
   */
  async *[Symbol.asyncIterator]() {
    for await (const orderURL of this.loadOrderURLs()) {
      yield Order.createFromURL(this.account, orderURL);
    }
  }

  /**
   * Loads all order URLs.
   * @param {string} ordersURL
   * @yields {string}
   */
  async *loadOrderURLs(ordersURL = this.ordersURL) {
    let orderURLs;
    let nextURL = ordersURL;
    while (nextURL) {
      ({ orderURLs, nextURL } = await this.loadPage(nextURL));
      yield* orderURLs;
    }
  }

  /**
   * Loads one page of the order list.
   * @param {string} pageURL
   * @yields {OrdersListPage}
   */
  async loadPage(pageURL) {
    const {
      headers: { link },
      body: { orders: orderURLs }
    } = this.account.acme.request(pageURL);

    let nextURL = null;
    if (link) {
      const [nextLink] = LinkHeader.parse(link).rel('next');
      if (nextLink) {
        nextURL = nextLink.uri;
      }
    }

    return { orderURLs, nextURL };
  }
}
