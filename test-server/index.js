const { ServerClient } = require('../es');
const NodeJSTransports = require('zetapush-cometd/lib/node/Transports');

const api = require('./api');

// Create new ZetaPush Client
const client = new ServerClient({
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business',
  transports: NodeJSTransports,
  sandboxId: 'C-flCeDl',
  login: 'gregory.houllier@zetapush.com',
  password: 'zp.2015',
  resource: 'node_js_worker'
});
client.helper.servers = Promise.resolve(['http://vm-str-1:8080/str']);

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
