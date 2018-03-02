import forge from 'node-forge';
import { assertIsKey } from './assertions';

const {
  jsbn: { BigInteger },
  pki: {
    createCertificationRequest,
    certificationRequestToPem,
    setRsaPrivateKey
  }
} = forge;

/**
 * Converts a `jose.JWK.Key` to a Forge key.
 *
 * @see https://github.com/digitalbazaar/forge/blob/74b7472b2143735fca0c68a7f20ba32c4fbd5397/lib/rsa.js#L1769-L1783
 *
 * @param  {jose.JWK.key} jwk
 * @return {object} Forge key
 */
function convertJoseKeyToForgeKey(jwk) {
  assertIsKey(jwk);
  if (jwk.get('kty') !== 'RSA')
    throw new TypeError(
      `Unsupported key algorithm '${jwk.get('kty')}'. Algorithm must be 'RSA'.`
    );

  // TODO: find more performant conversion
  return setRsaPrivateKey(
    new BigInteger(jwk.get('n', true).toString('hex'), 16),
    new BigInteger(jwk.get('e', true).toString('hex'), 16),
    new BigInteger(jwk.get('d', true).toString('hex'), 16),
    new BigInteger(jwk.get('p', true).toString('hex'), 16),
    new BigInteger(jwk.get('q', true).toString('hex'), 16),
    new BigInteger(jwk.get('dp', true).toString('hex'), 16),
    new BigInteger(jwk.get('dq', true).toString('hex'), 16),
    new BigInteger(jwk.get('qi', true).toString('hex'), 16)
  );
}
/**
 * Creates a CSR.
 *
 * @see https://github.com/digitalbazaar/forge/blob/57ebd54a01b4c38399229a7e7cccbd9a9e73f969/examples/create-csr.js
 *
 * @param  {jose.JWK.key} key
 * @param  {object[]} subject
 * @param  {object[]} [attributes]
 * @return {string} The PEM encoded CSR.
 */
export default function createCSR(key, subject, attributes = null) {
  const forgeKey = convertJoseKeyToForgeKey(key);
  const csr = createCertificationRequest();
  csr.publicKey = forgeKey;
  csr.setSubject(subject);
  if (attributes) csr.setAttributes(attributes);
  csr.sign(forgeKey);
  return certificationRequestToPem(csr);
}
