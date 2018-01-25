import jose from 'node-jose';
import debug, { IS_DEBUG } from './debug';
import { assertIsKey } from './assertions';

const { JWS, util: { base64url } } = jose;

/**
 * Creates a JWS.
 * @param {jose.JWK.Key} key
 * @param {Object} headerFields
 * @param {string} headerFields.alg
 * @param {string} headerFields.url
 * @param {string} headerFields.nonce
 * @param {Object} payload
 * @return {Object}
 * @throws {TypeError}
 */
export default async function sign(
  key,
  { alg, url, nonce, ...headerFields },
  payload
) {
  assertIsKey(key);

  const options = {
    alg,
    format: 'flattened',
    fields: { url, nonce, kid: null, ...headerFields }
  };

  const jws = await JWS.createSign(options, key)
    .update(JSON.stringify(payload))
    .final();

  // wrapping in IS_DEBUG since the base64 conversion is costly
  if (IS_DEBUG) {
    debug(jws);
    debug({
      protected: JSON.parse(base64url.decode(jws.protected).toString('utf8')),
      payload: JSON.parse(base64url.decode(jws.payload).toString('utf8'))
    });
  }

  return jws;
}
