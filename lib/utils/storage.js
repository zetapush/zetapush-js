'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provide fallback for DOMStorage
 * @access protected
 */
var MemoryStorage = function () {
  function MemoryStorage() {
    _classCallCheck(this, MemoryStorage);

    this._map = new Map();
  }

  MemoryStorage.prototype.getItem = function getItem(key) {
    return this._map.get(key);
  };

  MemoryStorage.prototype.setItem = function setItem(key, value) {
    return this._map.get(key);
  };

  MemoryStorage.prototype.removeItem = function removeItem(key) {
    this._map.delete(key);
  };

  MemoryStorage.prototype.clear = function clear() {
    this._map = new Map();
  };

  MemoryStorage.prototype.key = function key(n) {
    return Array.from(this._map.keys())[n];
  };

  _createClass(MemoryStorage, [{
    key: 'length',
    get: function get() {
      return this._map.size;
    }
  }]);

  return MemoryStorage;
}();

/**
 * @type {Storage}
 * @access protected
 */


var platformStorage = exports.platformStorage = typeof localStorage === 'undefined' ? new MemoryStorage() : localStorage;