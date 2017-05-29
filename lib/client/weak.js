'use strict';

exports.__esModule = true;
exports.WeakClient = undefined;

var _basic = require('./basic');

var _handshake = require('../authentication/handshake');

var _sessionPersistence = require('../utils/session-persistence');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * WeakClient config object.
 * @typedef {Object} WeakClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} deploymentId - Authentication deployment id, default value is 'weak_0'
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
 * const client = new ZetaPush.WeakClient({
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 * @example
 * // Explicit deploymentId
 * // WeakClient provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
 * // deploymentId default value is weak_0
 * const client = new ZetaPush.WeakClient({
 *   deploymentId: 'weak_0',
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 */
var WeakClient = exports.WeakClient = function (_Client) {
  _inherits(WeakClient, _Client);

  /**
   * Create a new ZetaPush WeakClient
   * @param {WeakClientConfig} config
   */
  function WeakClient(_ref) {
    var apiUrl = _ref.apiUrl,
        sandboxId = _ref.sandboxId,
        deploymentId = _ref.deploymentId,
        forceHttps = _ref.forceHttps,
        resource = _ref.resource,
        transports = _ref.transports;

    _classCallCheck(this, WeakClient);

    var authentication = function authentication() {
      var token = _this.getToken();
      var handshake = _handshake.Authentication.weak({
        deploymentId: deploymentId,
        token: token
      });
      return handshake;
    };
    /**
     * Call Client constructor with specific parameters
     */

    // Handle successful handshake
    var _this = _possibleConstructorReturn(this, _Client.call(this, { apiUrl: apiUrl, sandboxId: sandboxId, forceHttps: forceHttps, authentication: authentication, resource: resource, transports: transports }));

    var onSuccessfulHandshake = function onSuccessfulHandshake(_ref2) {
      var publicToken = _ref2.publicToken,
          userId = _ref2.userId,
          token = _ref2.token;

      if (token) {
        _this.strategy.set({ publicToken: publicToken, userId: userId, token: token });
      }
    };
    _this.addConnectionStatusListener({ onSuccessfulHandshake: onSuccessfulHandshake });
    /**
     * @access private
     * @type {SessionPersistenceStrategy}
     */
    _this.strategy = new _sessionPersistence.SessionPersistenceStrategy({ sandboxId: sandboxId });
    return _this;
  }
  /**
   * @return {string} The stored token
   */


  WeakClient.prototype.getToken = function getToken() {
    var _strategy$get = this.strategy.get(),
        token = _strategy$get.token;

    return token;
  };

  return WeakClient;
}(_basic.Client);