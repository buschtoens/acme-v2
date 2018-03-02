import jose from 'node-jose';

const { JWK } = jose;

const anoymousKeyStore = JWK.createKeyStore();

export default async function generateKey(kty, size, props) {
  return anoymousKeyStore.generate(kty, size, props);
}
