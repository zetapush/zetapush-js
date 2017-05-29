'use strict';

exports.__esModule = true;
exports.Authentication = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _authentications = require('../mapping/authentications');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ZetaPush deployables names
 */
var DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
};

/**
 * Provide abstraction over CometD handshake data structure
 * @access protected
 */

var AbstractHandshake = function () {
  /**
   * Create a new handshake manager
   * @param {{authType: string, sandboxId: string, deploymentId: string}} parameters
   */
  function AbstractHandshake(_ref) {
    var authType = _ref.authType,
        sandboxId = _ref.sandboxId,
        deploymentId = _ref.deploymentId;

    _classCallCheck(this, AbstractHandshake);

    /**
     * @access protected
     * @type {string}
     */
    this.authType = authType;
    /**
     * @access protected
     * @type {string}
     */
    this.sandboxId = sandboxId;
    /**
     * @access protected
     * @type {string}
     */
    this.deploymentId = deploymentId;
  }
  /**
   * @param {ClientHelper} client
   * @return {Object}
   */


  AbstractHandshake.prototype.getHandshakeFields = function getHandshakeFields(client) {
    var authentication = {
      data: this.authData,
      type: client.getSandboxId() + '.' + this.deploymentId + '.' + this.authType,
      version: this.authVersion
    };
    if (client.getResource()) {
      authentication.resource = client.getResource();
    }
    return {
      ext: {
        authentication: authentication
      }
    };
  };
  /**
   * Get auth version
   * @return {string}
   */


  _createClass(AbstractHandshake, [{
    key: 'authVersion',
    get: function get() {
      return 'none';
    }
  }]);

  return AbstractHandshake;
}();

/**
 * Provide abstraction over CometD token base handshake data structure
 * @access protected
 * @extends {AbstractHandshake}
 */


var TokenHandshake = function (_AbstractHandshake) {
  _inherits(TokenHandshake, _AbstractHandshake);

  /**
   * @param {{authType: string, deploymentId: string, token: string}} parameters
   */
  function TokenHandshake(_ref2) {
    var authType = _ref2.authType,
        deploymentId = _ref2.deploymentId,
        token = _ref2.token;

    _classCallCheck(this, TokenHandshake);

    /**
     * @access private
     * @type {string}
     */
    var _this = _possibleConstructorReturn(this, _AbstractHandshake.call(this, { deploymentId: deploymentId, authType: authType }));

    _this.token = token;
    return _this;
  }
  /**
   * @return {token: string}
   */


  _createClass(TokenHandshake, [{
    key: 'authData',
    get: function get() {
      var token = this.token;

      return {
        token: token
      };
    }
  }]);

  return TokenHandshake;
}(AbstractHandshake);

/**
 * Provide abstraction over CometD credentials based handshake data structure
 * @access protected
 * @extends {AbstractHandshake}
 */


var CredentialsHandshake = function (_AbstractHandshake2) {
  _inherits(CredentialsHandshake, _AbstractHandshake2);

  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   */
  function CredentialsHandshake(_ref3) {
    var authType = _ref3.authType,
        deploymentId = _ref3.deploymentId,
        login = _ref3.login,
        password = _ref3.password;

    _classCallCheck(this, CredentialsHandshake);

    /**
     * @access private
     * @type {string}
     */
    var _this2 = _possibleConstructorReturn(this, _AbstractHandshake2.call(this, { authType: authType, deploymentId: deploymentId }));

    _this2.login = login;
    /**
     * @access private
     * @type {string}
     */
    _this2.password = password;
    return _this2;
  }
  /**
   * Get auth data
   * @return {login: string, password: string}
   */


  _createClass(CredentialsHandshake, [{
    key: 'authData',
    get: function get() {
      var login = this.login,
          password = this.password;

      return {
        login: login, password: password
      };
    }
  }]);

  return CredentialsHandshake;
}(AbstractHandshake);

/**
 * Factory to create handshake
 * @access public
 */


var Authentication = exports.Authentication = function () {
  function Authentication() {
    _classCallCheck(this, Authentication);
  }

  /**
   * @param {{deploymentId: string, login: string, password: string}} parameters
   * @return {CredentialsHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-SIMPLE-AUTHENTICATION-DEPLOYMENT-ID>',
   *   login: <USER-LOGIN>,
   *   password: '<USER-PASSWORD>'
   * })
   */
  Authentication.simple = function simple(_ref4) {
    var _ref4$deploymentId = _ref4.deploymentId,
        deploymentId = _ref4$deploymentId === undefined ? _authentications.Simple.DEFAULT_DEPLOYMENT_ID : _ref4$deploymentId,
        login = _ref4.login,
        password = _ref4.password;

    return Authentication.create({
      authType: DeployableNames.AUTH_SIMPLE,
      deploymentId: deploymentId,
      login: login,
      password: password
    });
  };
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-WEAK-AUTHENTICATION-DEPLOYMENT-ID>',
   *   token: null
   * })
   */


  Authentication.weak = function weak(_ref5) {
    var _ref5$deploymentId = _ref5.deploymentId,
        deploymentId = _ref5$deploymentId === undefined ? _authentications.Weak.DEFAULT_DEPLOYMENT_ID : _ref5$deploymentId,
        token = _ref5.token;

    return Authentication.create({
      authType: DeployableNames.AUTH_WEAK,
      deploymentId: deploymentId,
      login: token,
      password: null
    });
  };
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-DELEGATING-AUTHENTICATION-DEPLOYMENT-ID>',
   *   token: null
   * })
   */


  Authentication.delegating = function delegating(_ref6) {
    var _ref6$deploymentId = _ref6.deploymentId,
        deploymentId = _ref6$deploymentId === undefined ? _authentications.Delegating.DEFAULT_DEPLOYMENT_ID : _ref6$deploymentId,
        token = _ref6.token;

    return Authentication.create({
      authType: DeployableNames.AUTH_DELEGATING,
      deploymentId: deploymentId,
      login: token,
      password: null
    });
  };
  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   * @return {TokenHandshake|CredentialsHandshake}
   */


  Authentication.create = function create(_ref7) {
    var authType = _ref7.authType,
        deploymentId = _ref7.deploymentId,
        login = _ref7.login,
        password = _ref7.password;

    if (password === null) {
      return new TokenHandshake({ authType: authType, deploymentId: deploymentId, token: login });
    }
    return new CredentialsHandshake({ authType: authType, deploymentId: deploymentId, login: login, password: password });
  };

  return Authentication;
}();