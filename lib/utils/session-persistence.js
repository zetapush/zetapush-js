'use strict';

exports.__esModule = true;
exports.SessionPersistenceStrategy = exports.ZETAPUSH_SESSION_KEY = undefined;

var _storage = require('./storage');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @type {string}
 */
var ZETAPUSH_SESSION_KEY = exports.ZETAPUSH_SESSION_KEY = 'zetapush.token';

/**
 * Provide abstraction for token persistence
 * @access protected
 */

var SessionPersistenceStrategy = exports.SessionPersistenceStrategy = function () {
  /**
   * @param {{sandboxId: string, storage: DOMStorage}} parameters
   */
  function SessionPersistenceStrategy() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        sandboxId = _ref.sandboxId,
        _ref$storage = _ref.storage,
        storage = _ref$storage === undefined ? _storage.platformStorage : _ref$storage;

    _classCallCheck(this, SessionPersistenceStrategy);

    /**
     * @access private
     * @type {string}
     */
    this.key = ZETAPUSH_SESSION_KEY + '.' + sandboxId;
    /**
     * @access private
     * @type {DOMStorage}
     */
    this.storage = storage;
  }
  /**
   * @return {string} session The stored session
   */


  SessionPersistenceStrategy.prototype.get = function get() {
    var key = this.key,
        storage = this.storage;

    var json = storage.getItem(key) || '{}';
    var session = {};
    try {
      session = JSON.parse(json);
    } catch (e) {}
    return session;
  };
  /**
   * @param {Object} session The session to store
   */


  SessionPersistenceStrategy.prototype.set = function set() {
    var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var key = this.key,
        storage = this.storage;

    var json = JSON.stringify(session);
    try {
      storage.setItem(key, json);
    } catch (e) {}
    return session;
  };

  return SessionPersistenceStrategy;
}();