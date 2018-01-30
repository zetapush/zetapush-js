#!/usr/bin/env node

const { _ } = require('minimist')(process.argv.slice(2));
const cwd = require('resolve-cwd');
const read = require('read-pkg');
const { ServerClient } = require('zetapush-js/es');
const { uuid } = require('zetapush-js/es/utils');
const transports = require('zetapush-cometd/lib/node/Transports');

const run = (api, config) => {
  const resource = `node_js_worker_${uuid()}`;

  config = {
    ...config,
    transports,
    resource,
  };

  console.log('[LOG] Config', config);

  const client = new ServerClient(config);

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
};

const moduleId = _.length === 1 ? `./${_[0]}` : '.';
const path = cwd(moduleId);
const api = require(path);

read(moduleId).then(({ zetapush }) => run(api, zetapush));
