import base64url from 'base64url';

export default class Challenge {
  constructor(authorization, data) {
    this.authorization = authorization;
    Object.assign(this, data);
  }

  /**
   * Several of the challenges in this document make use of a key authorization
   *   string.  A key authorization is a string that expresses a domain holder's
   *   authorization for a specified key to satisfy a specified challenge, by
   *   concatenating the token for the challenge with a key fingerprint,
   *   separated by a "." character:
   *
   * key-authz = token || '.' || base64url(JWK_Thumbprint(accountKey))
   *
   * The "JWK_Thumbprint" step indicates the computation specified in [RFC7638],
   *   using the SHA-256 digest [FIPS180-4].  As noted in JWA [RFC7518] any
   *   prepended zero octets in the fields of a JWK object MUST be stripped
   *   before doing the computation.
   *
   * As specified in the individual challenges below, the token for a challenge
   *   is a string comprised entirely of characters in the URL- safe base64
   *   alphabet.  The "||" operator indicates concatenation of strings.
   *
   * @type {string|null}
   */
  async computeKeyAuthorization() {
    if (!this.token) return null;
    return `${this.token}.${base64url(
      await this.authorization.order.account.key.thumbprint('sha-256')
    )}`;
  }

  async respond({
    keyAuthorization = this.computeKeyAuthorization(),
    ...otherData
  } = {}) {
    const { body } = await this.authorization.order.account.signedRequest(
      this.url,
      { keyAuthorization: await keyAuthorization, ...otherData },
      { kid: true }
    );
    Object.assign(this, body);
    return this;
  }
}
