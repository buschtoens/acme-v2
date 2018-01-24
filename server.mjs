import util from 'util';
import envProxyAgent from 'env-proxy-agent';
import ACMEV2Client from './';
import directoryUrls from './directory-urls';

const debug = util.debuglog('acme-server');

(async () => {
  const directoryUrl = directoryUrls['letsencrypt-staging'];

  ACMEV2Client.agent = envProxyAgent(directoryUrl);

  const acme = new ACMEV2Client({
    directory: await ACMEV2Client.loadDirectory(directoryUrl)
  });

  const accountKey = await acme.importAccountKey(
    await ACMEV2Client.generateAccountKey()
  );

  const account = await acme.newAccount({
    contact: ['j.buschtoens@ddg-online.de'],
    termsOfServiceAgreed: true
  });
})();
