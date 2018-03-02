import { assertIsAccount } from './assertions';
import AuthorizationsList from './authorizations-list';
import memoize from './decorators/memoize';

/**
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.3
 */
export default class Order {
  /**
   * The account this instance is associated with.
   * @type {Account}
   */
  account;

  /**
   * The URL for this order as provided by the server.
   * @type {string}
   */
  orderURL;

  /**
   * An {@link Iterator} that yields the {@link Authorization}s associated with
   *   this order.
   * @type {AuthorizationsList}
   */
  @memoize
  get authorizations() {
    return new AuthorizationsList(this);
  }
  set authorizations(urls) {
    this.authorizations.urls = urls;
  }

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
    const response = await account.signedRequest(
      account.acme.directory.newOrder,
      { identifiers, notBefore, notAfter },
      { kid: true }
    );

    const order = new Order(account);
    order.updateLocalInformation(response);

    return order;
  }

  /**
   * Updates the information of this instance.
   * @param {got.Response} res
   * @private
   */
  updateLocalInformation({
    headers: { location },
    body: { finalize, ...body } = {}
  }) {
    if (location) this.orderURL = location;
    if (finalize) this.finalizeURL = finalize;
    Object.assign(this, body);
  }

  async finalize() {}
}
