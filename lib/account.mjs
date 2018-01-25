import { assertIsACMEV2Client, assertIsKey } from './assertions';
import sign from './sign';
import OrdersList from './orders-list';

/**
 * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.2
 */
export default class Account {
  // /**
  //  * The isntance of {@link ACMEV2Client} this account is associated with.
  //  * @type {ACMEV2Client}
  //  */
  // acme;

  // /**
  //  * The account key.
  //  * @type {jose.JWK.key}
  //  */
  // key;

  // /**
  //  * The URL for this account as provided by the server.
  //  * @type {string}
  //  */
  // accountURL;

  // /**
  //  * The status of this account. Possible values are: "valid", "deactivated", and
  //  *   "revoked". The value "deactivated" should be used to indicate
  //  *   client-initiated deactivation whereas "revoked" should be used to indicate
  //  *   server- initiated deactivation.
  //  * @type {string}
  //  */
  // status;

  // /**
  //  * An array of URLs that the server can use to contact the client for issues
  //  *   related to this account. For example, the server may wish to notify the
  //  *   client about server-initiated revocation or certificate expiration.
  //  * @type {string[]}
  //  */
  // contact = [];

  // /**
  //  * Including this field in a new-account request, with a value of true,
  //  *   indicates the client's agreement with the terms of service. This field is
  //  *   not updateable by the client.
  //  * @type {boolean}
  //  */
  // termsOfServiceAgreed = false;

  // /**
  //  * A URL from which a list of orders submitted by this account can be fetched
  //  *   via a GET request, as described in Section 7.1.2.1.
  //  * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.1.2.1
  //  * @type {string}
  //  */
  // ordersURL;

  // /**
  //  * An {@link AsyncIterator} that yields the {@link Order}s associated with
  //  *   this account.
  //  * @type {OrdersList}
  //  */
  // orders = new OrdersList(this);

  /**
   * @param {ACMEV2Client} acme
   * @param {jose.JWK.key} key
   * @throws {TypeError}
   */
  constructor(acme, { key, accountURL }) {
    assertIsACMEV2Client(acme);
    assertIsKey(key);

    this.acme = acme;
    this.key = key;
    this.accountURL = accountURL;
    this.orders = new OrdersList(this);
  }

  /**
   * Finds an account URL by a key and returns it, if found.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.1
   * @param {ACMEV2Client} acme
   * @param {jose.JWK.key} key
   * @return {string}
   * @throws {AccountDoesNotExistError}
   */
  static async findAccountURLByKey(acme, key) {
    /*
     * If the server already has an account registered with the provided account
     *   key, then it MUST return a response with a 200 (OK) status code and
     *   provide the URL of that account in the Location header field. This
     *   allows a client that has an account key but not the corresponding
     *   account URL to recover the account URL.
     *
     * If a client wishes to find the URL for an existing account and does not
     *   want an account to be created if one does not already exist, then it
     *   SHOULD do so by sending a POST request to the new-account URL with a
     *   JWS whose payload has an "onlyReturnExisting" field set to "true"
     *   ({"onlyReturnExisting": true}). If a client sends such a request and an
     *   account does not exist, then the server MUST return an error response
     *   with status code 400 (Bad Request) and type
     *   "urn:ietf:params:acme:error:accountDoesNotExist".
     */
    const { headers: { location } } = await acme.signedRequest(
      key,
      acme.directory.newAccount,
      { onlyReturnExisting: true },
      { jwsHeaders: { jwk: key.toJSON() } }
    );

    return location;
  }

  /**
   * Finds an account by a key and returns it, if found.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.1
   * @param {ACMEV2Client} acme
   * @param {jose.JWK.key} key
   * @return {Account}
   * @throws {AccountDoesNotExistError}
   */
  static async findAccountByKey(acme, key) {
    return new Account(acme, {
      key,
      accountURL: await Account.findAccountURLByKey(acme, key)
    });
  }

  /**
   * Performs a signed request using this accounts key. Parameters are delgated
   *   to the signedRequest method of {@link ACMEV2Client}.
   */
  async signedRequest(...args) {
    return this.acme.signedRequest(this.key, ...args);
  }

  /**
   * Updates the information of this instance.
   * @param {got.Response} headers
   * @private
   */
  updateLocalInformation({
    headers: { location },
    body: { orders, ...body } = {}
  }) {
    if (location) this.accountURL = location;
    if (orders) this.ordersURL = orders;
    Object.assign(this, body);
  }

  /**
   * Creates a new account from the information assigned to this instance.
   *   Optionally takes a `payload` parameter to overwrite the instance
   *   information.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3
   * @param {object} payload
   * @param {boolean} assertDoesNotExist
   * @return {Account}
   * @throws {ExternalAccountRequiredError}
   * @throws {InvalidContact}
   * @throws {UnsupportedContact}
   */
  async create(
    payload = {
      contact: this.contact,
      termsOfServiceAgreed: this.termsOfServiceAgreed
    },
    assertDoesNotExist = true
  ) {
    if (assertDoesNotExist) {
      const accountURL = await Account.findAccountURLByKey(
        this.acme,
        this.key
      ).catch(() => null);

      if (accountURL)
        throw new Error(
          `There is already an account registered with the key '${
            this.key.kid
          }'. It has the following account URL: ${accountURL}`
        );
    }

    /*
     * A client creates a new account with the server by sending a POST request
     *   to the server's new-account URL. The body of the request is a stub
     *   account object containing the "contact" field and optionally the
     *   "termsOfServiceAgreed" field.
     */
    const response = await this.signedRequest(
      this.acme.directory.newAccount,
      { onlyReturnExisting: false, ...payload },
      { jwsHeaders: { jwk: this.key.toJSON() } }
    );

    this.updateLocalInformation(response);

    return this;
  }

  /**
   * Updates the account information on the server with the information that is
   *   assigned to this instance. Optionally takes a paylad parameter to
   *   overwrite the instance data with user given data.
   * Currently only accepts `contact` as a field.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.2
   * @param {object} payload
   * @return {Account}
   * @throws {InvalidContact}
   * @throws {UnsupportedContact}
   */
  async update(payload = { contact: this.contact }) {
    /*
     * If the client wishes to update this information in the future, it sends a
     *   POST request with updated information to the account URL. The server
     *   MUST ignore any updates to "order" fields or any other fields it does
     *   not recognize. If the server accepts the update, it MUST return a
     *   response with a 200 (OK) status code and the resulting account object.
     */
    const response = await this.signedRequest(this.accountURL, payload, {
      jwsHeaders: { kid: this.accountURL }
    });

    this.updateLocalInformation(response);

    return this;
  }

  /**
   * Updates or create the account with the information that is assigned to this
   *   instance. Optionally takes a paylad parameter to overwrite the instance
   *   data with user given data. Currently only accepts `contact` as a field.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.2
   * @param {object} payload
   * @return {Account}
   * @throws {InvalidContact}
   * @throws {UnsupportedContact}
   */
  async updateOrCreate(payload) {
    // test whether the account already exists
    const accountURL = await Account.findAccountURLByKey(
      this.acme,
      this.key
    ).catch(() => null);

    if (accountURL) {
      // account already exists
      this.accountURL = accountURL;
      return this.update(payload);
    }
    // account does not exist
    return this.save(payload, false);
  }

  /**
   * Retrieves the account information from the server.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.3
   */
  async load() {
    /*
     * Servers SHOULD NOT respond to GET requests for account resources as these
     *   requests are not authenticated. If a client wishes to query the server
     *   for information about its account (e.g., to examine the "contact" or
     *   "certificates" fields), then it SHOULD do so by sending a POST request
     *   with an empty update. That is, it should send a JWS whose payload is an
     *   empty object ({}).
     */
    return this.update({});
  }

  /**
   * Updates the key associated with this account.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.6
   * @param {jose.JWK.key} newKey
   * @return {Account}
   * @throws {TypeError}
   */
  async updateKey(newKey) {
    assertIsKey(newKey);

    const url = this.acme.directory.keyChange;
    const jwk = newKey.toJSON();

    /*
     * To change the key associated with an account, the client first constructs
     *   a key-change object describing the change that it would like the server
     *   to make.
     *
     * The client then encapsulates the key-change object in an
     *   "inner" JWS, signed with the requested new account key (i.e., the key
     *   matching the "newKey" value). This JWS then becomes the payload for the
     *   "outer" JWS that is the body of the ACME request.
     *
     * The inner JWS MUST meet the normal requirements, with the following
     *   differences:
     *
     * o  The inner JWS MUST have a "jwk" header parameter, containing the
     *    public key of the new key pair (i.e., the same value as the "newKey"
     *    field).
     *
     * o  The inner JWS MUST have the same "url" header parameter as the outer
     *    JWS.
     *
     * o  The inner JWS is NOT REQUIRED to have a "nonce" header parameter. The
     *    server MUST ignore any value provided for the "nonce" header
     *    parameter.
     */
    const keyChange = await sign(
      newKey,
      { url, jwk },
      { account: this.accountURL, newKey: jwk }
    );

    /*
     * The outer JWS MUST meet the normal requirements for an ACME JWS.
     * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-6.2
     */
    this.signedRequest(url, keyChange, {
      jwsHeaders: { jwk: this.key.toJSON() }
    });

    this.key = newKey;

    return this;
  }

  /**
   * Permanently deactivates the account.
   * @see https://tools.ietf.org/html/draft-ietf-acme-acme-09#section-7.3.7
   */
  async deactivate() {
    return this.update({ status: 'deactivated' });
  }
}
