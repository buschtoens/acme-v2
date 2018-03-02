import LinkHeader from 'http-link-header';
import { assertIsAccount } from './assertions';
import Order from './order';

// HACK: This works around a weird Babel error.
// https://github.com/babel/babel/pull/7452
const { asyncIterator } = Symbol;
const ErrorClass = Error;

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
  /**
   * The account this instance is associated with.
   * @type {Account}
   */
  account;

  /**
   * A URL from which a list of orders submitted by the associated account can
   *   be fetched via a GET request, as described in Section 7.1.2.1.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.2.1
   * @type {string}
   */
  url;

  /**
   * @param {Account} account
   * @throws {TypeError}
   */
  constructor(account) {
    assertIsAccount(account);
    this.account = account;
  }

  /**
   * Loads all orders of this OrdersList.
   * @yields {Order}
   */
  async *[asyncIterator]() {
    if (!this.url)
      throw new ErrorClass(
        `The 'orders' field of the account ${
          this.account
        } has not been initialized yet. Either your forgot to '.load()' the account or the server did not provide an 'orders' URL.`
      );

    for await (const orderURL of this.loadOrderURLs()) {
      yield Order.createFromURL(this.account, orderURL);
    }
  }

  /**
   * Loads all order URLs.
   * @param {string} url
   * @yields {string}
   */
  async *loadOrderURLs(ordersURL = this.url) {
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
    } = await this.account.acme.request(pageURL);

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
