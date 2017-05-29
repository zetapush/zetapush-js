'use strict';

exports.__esModule = true;
exports.SmartClient = undefined;

var _basic = require('./basic');

var _handshake = require('../authentication/handshake');

var _sessionPersistence = require('../utils/session-persistence');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * SmartClient config object.
 * @typedef {Object} SmartClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 * @property {Array} transports - Client transports list
 */

/**
 * @access public
 * @extends {Client}
 * @example
 * // Create a new WeakClient
 * const client = new ZetaPush.SmartClient({
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 */
var SmartClient = exports.SmartClient = function (_Client) {
  _inherits(SmartClient, _Client);

  /**
   * Create a new ZetaPush SmartClient
   * @param {SmartClientConfig} config
   */
  function SmartClient(_ref) {
    var apiUrl = _ref.apiUrl,
        sandboxId = _ref.sandboxId,
        forceHttps = _ref.forceHttps,
        resource = _ref.resource,
        transports = _ref.transports;

    _classCallCheck(this, SmartClient);

    var persistence = new _sessionPersistence.SessionPersistenceStrategy({ sandboxId: sandboxId });

    /**
     * @return {AbstractHandshakeManager}
     */
    var authentication = function authentication() {
      var session = persistence.get();
      var token = session.token;


      if (_this.hasCredentials()) {
        var _this$getCredentials = _this.getCredentials(),
            login = _this$getCredentials.login,
            password = _this$getCredentials.password;

        _this.setCredentials({});
        return _handshake.Authentication.simple({
          login: login,
          password: password
        });
      } else {
        if (_this.isStronglyAuthenticated(session)) {
          return _handshake.Authentication.simple({
            login: token,
            password: null
          });
        } else {
          return _handshake.Authentication.weak({
            token: token
          });
        }
      }
    };
    // Initialize base client

    /**
     * @access protected
     * @type {SessionPersistenceStrategy}
     */
    var _this = _possibleConstructorReturn(this, _Client.call(this, {
      apiUrl: apiUrl, sandboxId: sandboxId, authentication: authentication, forceHttps: forceHttps, resource: resource, transports: transports
    }));

    _this.persistence = persistence;
    /**
     * @access protected
     * @type {Object}
     */
    _this.credentials = {};
    /**
     * Handle connection lifecycle events
     * @access protected
     * @type {Object}
     */
    _this.lifeCycleConnectionHandler = _this.addConnectionStatusListener({
      onConnectionClosed: function onConnectionClosed() {
        persistence.set({});
      },
      onSuccessfulHandshake: function onSuccessfulHandshake(session) {
        if (session.token) {
          persistence.set(session);
        }
      }
    });
    // Properly disconnect client to avoir ghost connections
    /*
    window.addEventListener('beforeunload', () => {
      this.removeConnectionStatusListener(this.lifeCycleConnectionHandler)
      super.disconnect()
    })
    */
    return _this;
  }
  /**
   * Disconnect client from ZetaPush backend
   */


  SmartClient.prototype.disconnect = function disconnect() {
    _Client.prototype.disconnect.call(this);
  };
  /**
   * @return {Object}
   */


  SmartClient.prototype.getCredentials = function getCredentials() {
    return this.credentials;
  };
  /**
   * @return {Object}
   */


  SmartClient.prototype.getSession = function getSession() {
    return this.persistence.get();
  };
  /**
   * @return {boolean}
   */


  SmartClient.prototype.hasCredentials = function hasCredentials() {
    var _getCredentials = this.getCredentials(),
        login = _getCredentials.login,
        password = _getCredentials.password;

    return login && password;
  };
  /**
   * @return {boolean}
   */


  SmartClient.prototype.isStronglyAuthenticated = function isStronglyAuthenticated() {
    var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.persistence.get();

    return !this.isWeaklyAuthenticated(session) && typeof session.token === 'string';
  };
  /**
   * @return {boolean}
   */


  SmartClient.prototype.isWeaklyAuthenticated = function isWeaklyAuthenticated() {
    var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.persistence.get();

    return typeof session.publicToken === 'string';
  };
  /**
   * @param {{login: string, password: string}} parameters
   */


  SmartClient.prototype.setCredentials = function setCredentials(_ref2) {
    var login = _ref2.login,
        password = _ref2.password;

    this.credentials = { login: login, password: password };
  };

  return SmartClient;
}(_basic.Client);