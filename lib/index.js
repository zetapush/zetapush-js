'use strict';

exports.__esModule = true;

var _handshake = require('./authentication/handshake');

Object.defineProperty(exports, 'Authentication', {
  enumerable: true,
  get: function get() {
    return _handshake.Authentication;
  }
});

var _connectionStatus = require('./connection/connection-status');

Object.defineProperty(exports, 'ConnectionStatusListener', {
  enumerable: true,
  get: function get() {
    return _connectionStatus.ConnectionStatusListener;
  }
});

var _basic = require('./client/basic');

Object.defineProperty(exports, 'Client', {
  enumerable: true,
  get: function get() {
    return _basic.Client;
  }
});

var _smart = require('./client/smart');

Object.defineProperty(exports, 'SmartClient', {
  enumerable: true,
  get: function get() {
    return _smart.SmartClient;
  }
});

var _weak = require('./client/weak');

Object.defineProperty(exports, 'WeakClient', {
  enumerable: true,
  get: function get() {
    return _weak.WeakClient;
  }
});

var _mapping = require('./mapping');

Object.defineProperty(exports, 'services', {
  enumerable: true,
  get: function get() {
    return _mapping.services;
  }
});


/**
 * SDK Version
 * @type {string}
 */
var VERSION = exports.VERSION = '3.1.3';