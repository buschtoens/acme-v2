import keystore from 'node-jose/lib/jwk/keystore';

const { registry } = keystore;

export default async function generateKey(kty, size, props) {
  const keytype = registry.get(kty);
  if (!keytype) {
    return Promise.reject(new Error('unsupported key type'));
  }

  const jwk = await keytype.generate(size);
  return Object.assign(jwk, props, { kty });
}
