'use strict';

exports.__esModule = true;
exports.ClientHelper = undefined;

var _zetapushCometd = require('zetapush-cometd');

var _connectionStatus = require('../connection/connection-status');

var _services = require('../mapping/services');

var _index = require('../utils/index');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * CometD Messages enumeration
 * @type {Object}
 */
var Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
};

/**
 * Delay to update server url
 * @type {integer}
 */
var UPDATE_SERVER_URL_DELAY = 250;

/**
 * Default macro channel
 * @type {string}
 */
var DEFAULT_MACRO_CHANNEL = 'completed';

/**
 * Provide utilities and abstraction on CometD Transport layer
 * @access private
 */

var ClientHelper = exports.ClientHelper = function () {
  /**
   * Create a new ZetaPush client helper
   */
  function ClientHelper(_ref) {
    var _this = this;

    var apiUrl = _ref.apiUrl,
        sandboxId = _ref.sandboxId,
        _ref$forceHttps = _ref.forceHttps,
        forceHttps = _ref$forceHttps === undefined ? false : _ref$forceHttps,
        authentication = _ref.authentication,
        _ref$resource = _ref.resource,
        resource = _ref$resource === undefined ? null : _ref$resource,
        _ref$transports = _ref.transports,
        transports = _ref$transports === undefined ? _zetapushCometd.Transports : _ref$transports;

    _classCallCheck(this, ClientHelper);

    /**
     * @access private
     * @type {string}
     */
    this.sandboxId = sandboxId;
    /**
     * @access private
     * @type {function():AbstractHandshake}
     */
    this.authentication = authentication;
    /**
     * @access private
     * @type {string}
     */
    this.resource = resource;
    /**
     * @access private
     * @type {number}
     */
    this.requestId = 0;
    /**
     * @access private
     * @type {string}
     */
    this.userId = null;
    /**
     * @access private
     * @type {string}
     */
    this.uniqId = (0, _index.uuid)();
    /**
     * @access private
     * @type {Promise}
     */
    this.servers = (0, _index.getServers)({ apiUrl: apiUrl, sandboxId: sandboxId, forceHttps: forceHttps, transports: transports }).catch(function (error) {
      // Notify error in connection to server step
      _this.connectionToServerFail(error);
      // Return empty list
      return [];
    });
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.connectionListeners = [];
    /**
     * @access private
     * @type {boolean}
     */
    this.connected = false;
    /**
     * @access private
     * @type {boolean}
     */
    this.wasConnected = false;
    /**
     * @access private
     * @type {string}
     */
    this.serverUrl = null;
    /**
     * @access private
     * @type {string}
     */
    this.sessionId = null;
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.subscribeQueue = [];
    /**
     * @access private
     * @type {CometD}
     */
    this.cometd = new _zetapushCometd.CometD();

    // Register transports layers
    transports.ALL.forEach(function (_ref2) {
      var type = _ref2.type,
          Transport = _ref2.Transport;

      _this.cometd.registerTransport(type, new Transport());
    });

    // Handle transport exception
    this.cometd.onTransportException = function (cometd, transport) {
      // Try to find an other available server
      // Remove the current one from the _serverList array
      _this.updateServerUrl();
    };

    this.cometd.addListener('/meta/handshake', function (_ref3) {
      var ext = _ref3.ext,
          successful = _ref3.successful,
          advice = _ref3.advice,
          error = _ref3.error;

      _this.cometd._debug('ClientHelper::/meta/handshake', { ext: ext, successful: successful, advice: advice, error: error });
      if (successful) {
        var _ext$authentication = ext.authentication,
            _authentication = _ext$authentication === undefined ? null : _ext$authentication;

        _this.initialized(_authentication);
      } else {
        _this.handshakeFailure(error);
      }
    });

    this.cometd.addListener('/meta/handshake', function (_ref4) {
      var advice = _ref4.advice,
          error = _ref4.error,
          ext = _ref4.ext,
          successful = _ref4.successful;

      _this.cometd._debug('ClientHelper::/meta/handshake', { ext: ext, successful: successful, advice: advice, error: error });
      // AuthNegotiation
      if (!successful) {
        if (typeof advice === 'undefined') {
          return;
        }
        if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
          _this.authenticationFailed(error);
        } else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
          _this.negotiate(ext);
        }
      }
    });

    this.cometd.addListener('/meta/connect', function (_ref5) {
      var advice = _ref5.advice,
          channel = _ref5.channel,
          successful = _ref5.successful;

      _this.cometd._debug('ClientHelper::/meta/connect', { advice: advice, channel: channel, successful: successful });
      // ConnectionListener
      if (_this.cometd.isDisconnected()) {
        _this.connected = false;
        // Notify connection will close
        _this.connectionWillClose();
      } else {
        _this.wasConnected = _this.connected;
        _this.connected = successful;
        if (!_this.wasConnected && _this.connected) {
          _this.cometd.batch(_this, function () {
            // Unqueue subscriptions
            _this.subscribeQueue.forEach(function (_ref6) {
              var prefix = _ref6.prefix,
                  listener = _ref6.listener,
                  subscriptions = _ref6.subscriptions;

              _this.subscribe(prefix, listener, subscriptions);
            });
          });
          // Notify connection is established
          _this.connectionEstablished();
        } else if (_this.wasConnected && !_this.connected) {
          // Notify connection is broken
          _this.connectionBroken();
        }
      }
    });

    this.cometd.addListener('/meta/disconnect', function (_ref7) {
      var channel = _ref7.channel,
          successful = _ref7.successful;

      _this.cometd._debug('ClientHelper::/meta/disconnect', { channel: channel, successful: successful });
      if (_this.cometd.isDisconnected()) {
        _this.connected = false;
        // Notify connection is closed
        _this.connectionClosed();
      }
    });
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   * @return {number} handler
   */


  ClientHelper.prototype.addConnectionStatusListener = function addConnectionStatusListener(listener) {
    this.connectionListeners.push({
      enabled: true,
      listener: Object.assign(new _connectionStatus.ConnectionStatusListener(), listener)
    });
    return this.connectionListeners.length - 1;
  };
  /**
   * Notify listeners when handshake step succeed
   */


  ClientHelper.prototype.authenticationFailed = function authenticationFailed(error) {
    this.userId = null;
    this.connectionListeners.filter(function (_ref8) {
      var enabled = _ref8.enabled;
      return enabled;
    }).forEach(function (_ref9) {
      var listener = _ref9.listener;

      listener.onFailedHandshake(error);
    });
  };
  /**
   * Connect client using CometD Transport
   */


  ClientHelper.prototype.connect = function connect() {
    var _this2 = this;

    this.servers.then(function (servers) {
      if (servers.length > 0) {
        // Get a random server url
        _this2.serverUrl = (0, _index.shuffle)(servers);
        // Configure CometD
        _this2.cometd.configure({
          url: _this2.serverUrl + '/strd',
          backoffIncrement: 1000,
          maxBackoff: 60000,
          appendMessageTypeToURL: false
        });
        // Send handshake fields
        _this2.cometd.handshake(_this2.getHandshakeFields());
      } else {
        // No servers available
        _this2.noServerUrlAvailable();
      }
    });
  };
  /**
   * Notify listeners when connection is broken
   */


  ClientHelper.prototype.connectionBroken = function connectionBroken() {
    this.connectionListeners.filter(function (_ref10) {
      var enabled = _ref10.enabled;
      return enabled;
    }).forEach(function (_ref11) {
      var listener = _ref11.listener;

      listener.onConnectionBroken();
    });
  };
  /**
   * Notify listeners when connection is closed
   */


  ClientHelper.prototype.connectionClosed = function connectionClosed() {
    this.userId = null;
    this.connectionListeners.filter(function (_ref12) {
      var enabled = _ref12.enabled;
      return enabled;
    }).forEach(function (_ref13) {
      var listener = _ref13.listener;

      listener.onConnectionClosed();
    });
  };
  /**
   * Notify listeners when connection is established
   */


  ClientHelper.prototype.connectionEstablished = function connectionEstablished() {
    this.connectionListeners.filter(function (_ref14) {
      var enabled = _ref14.enabled;
      return enabled;
    }).forEach(function (_ref15) {
      var listener = _ref15.listener;

      listener.onConnectionEstablished();
    });
  };
  /**
   * Notify listeners when connection to server fail
   */


  ClientHelper.prototype.connectionToServerFail = function connectionToServerFail(failure) {
    this.connectionListeners.filter(function (_ref16) {
      var enabled = _ref16.enabled;
      return enabled;
    }).forEach(function (_ref17) {
      var listener = _ref17.listener;

      listener.onConnectionToServerFail(failure);
    });
  };
  /**
   * Notify listeners when connection will close
   */


  ClientHelper.prototype.connectionWillClose = function connectionWillClose() {
    this.connectionListeners.filter(function (_ref18) {
      var enabled = _ref18.enabled;
      return enabled;
    }).forEach(function (_ref19) {
      var listener = _ref19.listener;

      listener.onConnectionWillClose();
    });
  };
  /**
   * Create a promise based macro service
   * @experimental
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */


  ClientHelper.prototype.createAsyncMacroService = function createAsyncMacroService(_ref20) {
    var listener = _ref20.listener,
        Type = _ref20.Type,
        _ref20$deploymentId = _ref20.deploymentId,
        deploymentId = _ref20$deploymentId === undefined ? Type.DEFAULT_DEPLOYMENT_ID : _ref20$deploymentId;

    var prefix = '/service/' + this.getSandboxId() + '/' + deploymentId;
    var $publish = this.getAsyncMacroPublisher(prefix);
    // Create service by publisher
    return this.createServiceByPublisher({ listener: listener, prefix: prefix, Type: Type, $publish: $publish });
  };
  /**
   * Create a publish/subscribe service
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */


  ClientHelper.prototype.createService = function createService(_ref21) {
    var listener = _ref21.listener,
        Type = _ref21.Type,
        _ref21$deploymentId = _ref21.deploymentId,
        deploymentId = _ref21$deploymentId === undefined ? Type.DEFAULT_DEPLOYMENT_ID : _ref21$deploymentId;

    var isMacroType = (0, _index.isDerivedOf)(Type, _services.Macro);
    var prefix = '/service/' + this.getSandboxId() + '/' + deploymentId;
    var $publish = isMacroType ? this.getMacroPublisher(prefix) : this.getServicePublisher(prefix);
    // Create service by publisher
    return this.createServiceByPublisher({ listener: listener, prefix: prefix, Type: Type, $publish: $publish });
  };
  /**
   * @param {{listener: Object, prefix: string, Type: class, $publish: Function}} parameters
   * @return {Object} service
   */


  ClientHelper.prototype.createServiceByPublisher = function createServiceByPublisher(_ref22) {
    var listener = _ref22.listener,
        prefix = _ref22.prefix,
        Type = _ref22.Type,
        $publish = _ref22.$publish;

    var service = new Type({ $publish: $publish });
    // Store subscription in service instance
    service.$subscriptions = this.subscribe(prefix, listener);
    return service;
  };
  /**
   * Disconnect CometD client
   */


  ClientHelper.prototype.disconnect = function disconnect() {
    this.cometd.disconnect(true);
  };
  /**
   * Get a publisher for a macro service that return a promise
   * @experimental
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */


  ClientHelper.prototype.getAsyncMacroPublisher = function getAsyncMacroPublisher(prefix) {
    var _this3 = this;

    return function (name, parameters) {
      var hardFail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var debug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var channel = prefix + '/call';
      var uniqRequestId = _this3.getUniqRequestId();
      var subscriptions = {};
      return new Promise(function (resolve, reject) {
        var _listener;

        var handler = function handler(_ref23) {
          var _ref23$data = _ref23.data,
              data = _ref23$data === undefined ? {} : _ref23$data;
          var _data$result = data.result,
              result = _data$result === undefined ? {} : _data$result,
              _data$errors = data.errors,
              errors = _data$errors === undefined ? [] : _data$errors,
              requestId = data.requestId;

          if (requestId === uniqRequestId) {
            // Handle errors
            if (errors.length > 0) {
              reject(errors);
            } else {
              resolve(result);
            }
            _this3.unsubscribe(subscriptions);
          }
        };
        // Create dynamic listener method
        var listener = (_listener = {}, _listener[name] = handler, _listener[DEFAULT_MACRO_CHANNEL] = handler, _listener);
        // Ad-Hoc subscription
        _this3.subscribe(prefix, listener, subscriptions);
        // Publish message on channel
        _this3.publish(channel, {
          debug: debug,
          hardFail: hardFail,
          name: name,
          parameters: parameters,
          requestId: uniqRequestId
        });
      });
    };
  };
  /**
   * Get client id
   * @return {string} clientId
   */


  ClientHelper.prototype.getClientId = function getClientId() {
    return this.cometd.getClientId();
  };
  /**
   * Get CometD handshake parameters
   * @return {Object}
   */


  ClientHelper.prototype.getHandshakeFields = function getHandshakeFields() {
    var handshake = this.authentication();
    return handshake.getHandshakeFields(this);
  };
  /**
   * Get a publisher for a macro service
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */


  ClientHelper.prototype.getMacroPublisher = function getMacroPublisher(prefix) {
    var _this4 = this;

    return function (name, parameters) {
      var hardFail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var debug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var channel = prefix + '/call';
      var requestId = _this4.getUniqRequestId();
      return _this4.publish(channel, {
        debug: debug,
        hardFail: hardFail,
        name: name,
        parameters: parameters,
        requestId: requestId
      });
    };
  };
  /**
   * Get queued subscription index
   * @return {Object} index
   */


  ClientHelper.prototype.getQueuedSubscription = function getQueuedSubscription() {
    var subscriptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var index = this.subscribeQueue.findIndex(function (element) {
      return subscriptions === element.subscriptions;
    });
    return {
      index: index,
      queued: index > -1
    };
  };
  /**
   * Get resource
   * @return {string}
   */


  ClientHelper.prototype.getResource = function getResource() {
    return this.resource;
  };
  /**
   * Get sandbox id
   * @return {string}
   */


  ClientHelper.prototype.getSandboxId = function getSandboxId() {
    return this.sandboxId;
  };
  /**
   * Get server urls list
   * @return {Promise} servers
   */


  ClientHelper.prototype.getServers = function getServers() {
    return this.servers;
  };
  /**
   * Get a publisher for a service
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */


  ClientHelper.prototype.getServicePublisher = function getServicePublisher(prefix) {
    var _this5 = this;

    return function (method, parameters) {
      var channel = prefix + '/' + method;
      return _this5.publish(channel, parameters);
    };
  };
  /**
   * Get uniq request id
   * @return {string}
   */


  ClientHelper.prototype.getUniqRequestId = function getUniqRequestId() {
    return this.getClientId() + ':' + this.uniqId + ':' + ++this.requestId;
  };
  /**
   * Get user id
   * @return {string}
   */


  ClientHelper.prototype.getUserId = function getUserId() {
    return this.userId;
  };
  /**
   * Manage handshake failure case
   */


  ClientHelper.prototype.handshakeFailure = function handshakeFailure() {
    this.userId = null;
  };
  /**
   * Notify listeners when connection is established
   */


  ClientHelper.prototype.initialized = function initialized(authentication) {
    if (authentication) {
      this.userId = authentication.userId;
    }
    this.connectionListeners.filter(function (_ref24) {
      var enabled = _ref24.enabled;
      return enabled;
    }).forEach(function (_ref25) {
      var listener = _ref25.listener;

      listener.onSuccessfulHandshake(authentication);
    });
  };
  /**
   * Is client connected to ZetaPush
   * @return {boolean}
   */


  ClientHelper.prototype.isConnected = function isConnected() {
    return !this.cometd.isDisconnected();
  };
  /**
   * Notify listeners when a message is lost
   */


  ClientHelper.prototype.messageLost = function messageLost(channel, data) {
    this.connectionListeners.filter(function (_ref26) {
      var enabled = _ref26.enabled;
      return enabled;
    }).forEach(function (_ref27) {
      var listener = _ref27.listener;

      listener.onMessageLost(channel, data);
    });
  };
  /**
   * Negociate authentication
   */


  ClientHelper.prototype.negotiate = function negotiate(ext) {
    this.cometd._debug('ClientHelper::negotiate', ext);
  };
  /**
   * Notify listeners when no server url available
   */


  ClientHelper.prototype.noServerUrlAvailable = function noServerUrlAvailable() {
    this.connectionListeners.filter(function (_ref28) {
      var enabled = _ref28.enabled;
      return enabled;
    }).forEach(function (_ref29) {
      var listener = _ref29.listener;

      listener.onNoServerUrlAvailable();
    });
  };
  /**
   * Wrap CometdD publish method
   * @param {String} channel
   * @param {Object} parameters
   * @return {Object}
   */


  ClientHelper.prototype.publish = function publish(channel) {
    var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    this.cometd.publish(channel, parameters);
    return { channel: channel, parameters: parameters };
  };
  /**
   * Remove a connection status listener
   */


  ClientHelper.prototype.removeConnectionStatusListener = function removeConnectionStatusListener(handler) {
    var listener = this.connectionListeners[handler];
    if (listener) {
      listener.enabled = false;
    }
  };
  /**
   * Set a new authentication methods
   * @param {function():AbstractHandshake} authentication
   */


  ClientHelper.prototype.setAuthentication = function setAuthentication(authentication) {
    this.authentication = authentication;
  };
  /**
   * Set logging level for CometD client
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */


  ClientHelper.prototype.setLogLevel = function setLogLevel(level) {
    this.cometd.setLogLevel(level);
  };
  /**
   * Subsribe all methods defined in the listener for the given prefixed channel
   * @param {string} prefix - Channel prefix
   * @param {Object} listener
   * @param {Object} subscriptions
   * @return {Object} subscriptions
   */


  ClientHelper.prototype.subscribe = function subscribe(prefix) {
    var listener = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var subscriptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var _getQueuedSubscriptio = this.getQueuedSubscription(subscriptions),
        queued = _getQueuedSubscriptio.queued;

    if (!queued) {
      // Store arguments to renew subscriptions on connection
      this.subscribeQueue.push({ prefix: prefix, listener: listener, subscriptions: subscriptions });
    }
    // Subscribe if user is connected
    if (!this.cometd.isDisconnected()) {
      for (var method in listener) {
        if (listener.hasOwnProperty(method)) {
          var channel = prefix + '/' + method;
          subscriptions[method] = this.cometd.subscribe(channel, listener[method]);
        }
      }
    }
    return subscriptions;
  };
  /**
  * Remove current server url from the server list and shuffle for another one
  */


  ClientHelper.prototype.updateServerUrl = function updateServerUrl() {
    var _this6 = this;

    this.servers.then(function (servers) {
      var index = servers.indexOf(_this6.serverUrl);
      if (index > -1) {
        servers.splice(index, 1);
      }
      if (servers.length === 0) {
        // No more server available
        _this6.noServerUrlAvailable();
      } else {
        _this6.serverUrl = (0, _index.shuffle)(servers);
        _this6.cometd.configure({
          url: _this6.serverUrl + '/strd'
        });
        setTimeout(function () {
          _this6.cometd.handshake(_this6.getHandshakeFields());
        }, UPDATE_SERVER_URL_DELAY);
      }
    });
  };
  /**
   * Remove all subscriptions
   * @param {Object} subscriptions
   */


  ClientHelper.prototype.unsubscribe = function unsubscribe() {
    var subscriptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Unsubscribe
    for (var method in subscriptions) {
      if (subscriptions.hasOwnProperty(method)) {
        var subscription = subscriptions[method];
        this.cometd.unsubscribe(subscription);
      }
    }
    // Remove subscription from queue

    var _getQueuedSubscriptio2 = this.getQueuedSubscription(subscriptions),
        index = _getQueuedSubscriptio2.index,
        queued = _getQueuedSubscriptio2.queued;

    if (queued) {
      this.subscribeQueue.splice(index, 1);
    }
  };

  return ClientHelper;
}();