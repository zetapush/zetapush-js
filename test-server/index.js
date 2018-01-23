const { ServerClient } = require('../es');
const { uuid } = require('../es/utils');
const transports = require('zetapush-cometd/lib/node/Transports');

const api = require('./api');

const resource = `node_js_worker_${uuid()}`

const config = {
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business',
  transports,
  sandboxId: 'C-flCeDl',
  login: 'gregory.houllier@zetapush.com',
  password: 'zp.2015',
  resource
};

console.log(config);

// Create new ZetaPush Client
const client = new ServerClient(config);
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
