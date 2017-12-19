const { ServerClient } = require('../es');
const NodeJSTransports = require('zetapush-cometd/lib/node/Transports');

const reduce = async (list) =>
  list.reduce((cumulator, value) => cumulator + value, 0);
const hello = async () => `Hello World from JavaScript ${Date.now()}`;

(async function main() {
  // Create new ZetaPush Client
  const client = new ServerClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business',
    transports: NodeJSTransports,
    sandboxId: 'pPMDYGEz',
    login: 'gregory.houllier@zetapush.com',
    password: 'zp.2015',
  });
  client.helper.servers = Promise.resolve(['http://hq.zpush.io:9081/str']);
  await client.connect();
  client.subscribeTaskServer({
    reduce,
    hello,
  });
})();
