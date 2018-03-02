import 'dotenv/config';
import envProxyAgent from 'env-proxy-agent';
import fs from 'mz/fs';
import jose from 'node-jose';
import ACMEV2Client from './';
import directoryUrls from '../directory-urls.json';
import AccountDoesNotExistError from './errors/account-does-not-exist';
import generateKey from './generate-key';

const { JWK } = jose;

const ACCOUNT_KEY_FILE = './account-key.json';

const directoryUrl = directoryUrls['letsencrypt-staging'];

(async () => {
  ACMEV2Client.agent = envProxyAgent(directoryUrl);

  debugger;
  const acme = new ACMEV2Client({
    directory: await ACMEV2Client.loadDirectory(directoryUrl)
  });

  let account;
  if (await fs.exists(ACCOUNT_KEY_FILE)) {
    const key = await JWK.asKey(await fs.readFile(ACCOUNT_KEY_FILE));
    try {
      // try to find an existing account for that key
      account = await acme.findAccountByKey(key);
      console.log(`Found an account for ${key.kid}: ${account.accountURL}`);
    } catch (error) {
      // throw any other error than AccountDoesNotExistError
      if (!(error instanceof AccountDoesNotExistError)) throw error;

      // the account does not exist, so create one
      console.log(`There's no account for ${key.kid}. Creating a new one.`);
      account = await acme.createAccount({
        key,
        contact: ['mailto:j.buschtoens@ddg-online.de'],
        termsOfServiceAgreed: true
      });
    }
  } else {
    // there's no key yet, so create a new account with an implicitly generated key
    console.log(
      `There's no key located at ${ACCOUNT_KEY_FILE}. Creating a new account.`
    );
    account = await acme.createAccount({
      key: await generateKey('RSA'),
      contact: ['mailto:j.buschtoens@ddg-online.de'],
      termsOfServiceAgreed: true
    });
    console.log(`Created a new account: ${account.accountURL}`);

    // save the implicitly generated key
    await fs.writeFile(
      ACCOUNT_KEY_FILE,
      JSON.stringify(account.key.toJSON(true), null, 2)
    );
    console.log(`Saving key ${account.key.kid} as ${ACCOUNT_KEY_FILE}.`);
  }

  // create a new order
  const order = await account.createOrder({
    identifiers: [
      { type: 'dns', value: 'barmer.ddg-webservice.de' },
      { type: 'dns', value: '*.barmer.ddg-webservice.de' }
    ]
  });

  console.log(order);

  const authorizations = await Promise.all(Array.from(order.authorizations));

  for (const authorization of authorizations) {
    console.log(authorization);

    for (const challenge of authorization.challenges) {
      console.log(challenge);
      console.log(await challenge.respond());
    }
  }
})();
