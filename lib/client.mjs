import got from 'got';
import util from 'util';
import jws from 'jws';
import pemjwk from 'pem-jwk';
import jose from 'node-jose';
import pkg from '../package.json';

const USER_AGENT = `${pkg.name} ${pkg.version} via Node.js ${
  process.version
} on ${process.platform}`;

const debug = util.debuglog('acme');

export default class ACMEV2Client {
  // agent = null;
  // keystore = jose.JWK.createKeyStore();

  constructor({ directory, key, privateKey, publicKey } = {}) {
    this.keystore = jose.JWK.createKeyStore();
    this.accountKey = this.importKey(key);

    if (typeof directory === 'string')
      return (async () =>
        new ACMEV2Client({
          // please don't tell mom about this convenience hack
          directory: await ACMEV2Client.loadDirectory(directory),
          privateKey,
          publicKey
        }))();

    if (typeof directory !== 'object')
      throw new TypeError(
        'Expected directory to be an object with endpoint URLs.'
      );

    this.directory = directory;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  async importKey

  static async request(url, requestBody, options = {}) {
    debug(`Requesting '${url}'.`);

    const { headers, body } = await got(url, {
      headers: {
        'user-agent': USER_AGENT
      },
      body: requestBody,
      encoding: 'utf8',
      json: true,
      timeout: 5000,
      agent: ACMEV2Client.agent,
      ...options
    });

    debug({ headers, body });

    return { headers, body };
  }

  static async loadDirectory(directoryUrl) {
    return (await ACMEV2Client.request(directoryUrl, null, { method: 'GET' }))
      .body;
  }

  async getNonce() {
    const { headers } = await ACMEV2Client.request(
      this.directory.newNonce,
      null,
      { method: 'HEAD' }
    );
    return headers['Replay-Nonce'];
  }

  async sign(
    { alg = 'RS512', nonce = this.getNonce(), ...headerFields },
    payload
  ) {
    return jws.sign({
      header: { alg, nonce: await nonce, ...headerFields },
      privateKey: this.privateKey,
      payload
    });
  }

  async signedRequest(url, requestBody, headerFields = {}) {
    return ACMEV2Client.request(
      url,
      await this.sign({ url, ...headerFields }, requestBody)
    );
  }

  async newAccount({
    contact = [],
    termsOfServiceAgreed = false,
    onlyReturnExisting = false
  } = {}) {
    console.log(this.publicKey);
    console.log(pemjwk.pem2jwk(this.publicKey));
    this.signedRequest(
      this.directory.newAccount,
      { contact, termsOfServiceAgreed, onlyReturnExisting },
      { jwk: pemjwk.pem2jwk(this.publicKey) }
    );
  }
}
