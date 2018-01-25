import got from 'got';
import jose from 'node-jose';
import USER_AGENT from './user-agent';
import generateKey from './generate-key';
import sign from './sign';
import { wrapError } from './errors';
import debug from './debug';

const HEADER_NONCE = 'replay-nonce';

export default class ACMEV2Client {
  // directory = {};
  // keystore = jose.JWK.createKeyStore();
  // agent = null;
  // accountKey = null;
  // nonces = [];
  // maxNonceAge = 5 * 60 * 1000;

  constructor({ directory, agent } = {}) {
    this.keystore = jose.JWK.createKeyStore();

    if (typeof directory !== 'object')
      throw new TypeError(
        'Expected directory to be an object with endpoint URLs.'
      );

    this.directory = directory;
    this.agent = agent;
    this.nonces = [];
    this.maxNonceAge = 5 * 60 * 1000;
  }

  static async generateAccountKey({ kty = 'RSA', size, props } = {}) {
    return generateKey(kty, size, props);
  }

  static async loadDirectory(directoryUrl, options = {}) {
    debug(`Loading directory from '${directoryUrl}'.`);
    return (await ACMEV2Client.request(directoryUrl, options)).body;
  }

  static async request(url, { headers = {}, body, ...options } = {}) {
    debug(`Requesting '${url}'.`);

    try {
      const response = await got(url, {
        headers: {
          'user-agent': USER_AGENT,
          'content-type': 'application/jose+json',
          ...headers
        },
        body,
        encoding: 'utf8',
        json: true,
        // timeout: 20 * 1000,
        agent: ACMEV2Client.agent,
        ...options
      });
      debug({
        url,
        staus: [response.statusCode, response.statusMessage],
        headers: response.headers,
        body: response.body
      });
      return response;
    } catch (error) {
      debug({ error, body: error.response && error.response.body });
      throw wrapError(error);
    }
  }

  async request(url, { saveNonce = true, ...options } = {}) {
    // delegate to global request method but overwrite global agent with local agent, if present
    const response = await ACMEV2Client.request(url, {
      agent: this.agent || ACMEV2Client.agent,
      ...options
    });

    // if there's a nonce, push it into the nonce queue
    if (saveNonce && response.headers && response.headers[HEADER_NONCE])
      this.nonces.push([Date.now(), response.headers[HEADER_NONCE]]);

    return response;
  }

  async getNonce() {
    // if the nonce queue is filled, get a nonce from there and check if is stale
    for (
      let now = Date.now(), { maxNonceAge } = this, timestamp, nonce;
      this.nonces.length;
      [timestamp, nonce] = this.nonces.unshift
    )
      if (now - timestamp < maxNonceAge) return nonce;

    // otherwise request a fresh nonce
    const { headers } = await this.request(this.directory.newNonce, {
      method: 'HEAD',
      saveNonce: false
    });
    return headers[HEADER_NONCE];
  }

  async sign(
    key,
    { alg, url, nonce = this.getNonce(), ...headerFields },
    payload
  ) {
    return sign(
      key,
      { alg, url, nonce: await nonce, ...headerFields },
      payload
    );
  }

  async signedRequest(key, url, body, { jwsHeaders, ...options } = {}) {
    return ACMEV2Client.request(url, {
      body: await this.sign(key, { url, ...jwsHeaders }, body),
      json: true,
      ...options
    });
  }

  async importAccountKey(key) {
    this.accountKey = await this.keystore.add(key);
    return this.accountKey;
  }

  async newAccount({
    contact = [],
    termsOfServiceAgreed = false,
    onlyReturnExisting = false
  } = {}) {
    const { headers: { location }, body } = await this.signedRequest(
      this.directory.newAccount,
      { contact, termsOfServiceAgreed, onlyReturnExisting },
      { jwsHeaders: { jwk: this.accountKey.toJSON() } }
    );
    this.accountUrl = location;
    return body;
  }
}
