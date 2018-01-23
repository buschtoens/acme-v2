import util from 'util';
import envProxyAgent from 'env-proxy-agent';
import RSA from 'node-rsa';
import jose from 'node-jose';
import ACME from './';

const debug = util.debuglog('acme-server');

(async () => {
  const directoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory';
  ACME.agent = envProxyAgent(directoryUrl);

  const keystore = jose.JWK.createKeyStore();

  const key = await keystore.generate('RSA', 2048);

  console.log(key);

  const privateKey = key.exportKey('private');
  const publicKey = key.exportKey('public');

  const acme = await new ACME({
    directory: directoryUrl,
    privateKey,
    publicKey
  });

  const account = await acme.newAccount({
    contact: ['j.buschtoens@ddg-online.de'],
    termsOfServiceAgreed: true
  });

  console.log(account);
})();
