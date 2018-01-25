import util from 'util';
import envProxyAgent from 'env-proxy-agent';
import fs from 'mz/fs';
import ACMEV2Client from './';
import directoryUrls from './directory-urls';

// const debug = util.debuglog('acme-server');

const ACCOUNT_KEY_FILE = './account-key.json';

const directoryUrl = directoryUrls['letsencrypt-staging'];

(async () => {
  ACMEV2Client.agent = envProxyAgent(directoryUrl);

  const acme = new ACMEV2Client({
    directory: await ACMEV2Client.loadDirectory(directoryUrl)
  });

  if (await fs.exists(ACCOUNT_KEY_FILE)) {
    await acme.importAccountKey(await fs.readFile(ACCOUNT_KEY_FILE));
  } else {
    const accountKey = await acme.importAccountKey(
      await ACMEV2Client.generateAccountKey()
    );
    await fs.writeFile(
      ACCOUNT_KEY_FILE,
      JSON.stringify(accountKey.toJSON(true), null, 2)
    );
  }

  const account = await acme.newAccount({
    contact: ['j.buschtoens@ddg-online.de'],
    termsOfServiceAgreed: true
  });
})();
