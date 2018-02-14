#!/usr/bin/env node

const { _ } = require('minimist')(process.argv.slice(2));
const cwd = require('resolve-cwd');
const read = require('read-pkg');
const { ServerClient } = require('zetapush-js/es');
const { uuid } = require('zetapush-js/es/utils');
const transports = require('zetapush-cometd/lib/node/Transports');

const TYPES = ['AsyncFunction']
const TYPE_PATTERN = /\[object (\w+)\]/
const toString = (value) => Object.prototype.toString.call(value)
const getType = (value) => {
  const [, type = 'Null'] = TYPE_PATTERN.exec(toString(value))
  return type
}
const isAsyncFunction = (method) => TYPES.indexOf(getType(method)) > -1

const apify = (declaration = {}) => Object.entries(declaration).filter(([property, value]) => isAsyncFunction(value)).reduce((api, [property, value]) => {
  api[property] = value;
  return api
}, {})

const inject = (client, declaration = {}) => {
  const cache = new WeakMap();
  declaration.Factory = (Type) => {
    const service = cache.has(Type) ? cache.get(Type) : cache.set(Type, client.createAsyncService({
      Type
    })).get(Type)
    return service
  };
  return declaration;
}

const run = (api, config) => {
  const resource = `node_js_worker_${uuid()}`;

  config = {
    ...config,
    transports,
    resource,
  };

  console.log('[LOG] Config', config);

  const client = new ServerClient(config);

  const onTerminalSignal = (signal) => {
    console.log('[LOG] Properly disconnect client');
    client.disconnect().then((() => {
      console.log('[LOG] Client properly disconnected');
      process.exit(0);
    }));
  };

  const TERMINATE_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  TERMINATE_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      onTerminalSignal(signal)
    });
  });

  client
    .connect()
    .then(() => {
      console.log('[LOG] Connected');
    })
    .then(() => {
      console.log('[LOG] Register Server Task');
      const declaration = apify(inject(client, api))
      client.subscribeTaskServer(declaration);
    })
    .catch((error) => console.error('[ERROR] ZetaPush V3 Error', error));
};

const moduleId = _.length === 1 ? `./${_[0]}` : '.';
const path = cwd(moduleId);
const api = require(path);

read(moduleId).then(({ zetapush }) => run(api, zetapush));
