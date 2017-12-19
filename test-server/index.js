const { ServerClient } = require('../es');
const NodeJSTransports = require('zetapush-cometd/lib/node/Transports');

const api = require('./api');

// Create new ZetaPush Client
const client = new ServerClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  transports: NodeJSTransports,
  sandboxId: 'pPMDYGEz',
  login: 'gregory.houllier@zetapush.com',
  password: 'zp.2015',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9081/str']);

client
  .connect()
  .then(() => {
    console.log('[LOG] Connected');
  })
  .then(() => {
    console.log('[LOG] Register Server Task');
    client.subscribeTaskServer(api);
  })
  .catch((error) => console.error('[ERROR] ZetaPush V3 Error', error));
