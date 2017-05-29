'use strict';

exports.__esModule = true;
/**
 * Match unsecure pattern web
 * @type {RegExp}
 */
var HTTP_PATTERN = /^http:\/\/|^\/\//;

/**
 * Http protocol
 * @type {string}
 */
var HTTP_PROTOCOL = 'http:';

/**
 * Https protocol
 * @type {string}
 */
var HTTPS_PROTOCOL = 'https:';

/**
 * Alpha numeric dictionary
 */
var DICTIONARY = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Default ZetaPush API URL
 * @access private
 */
var API_URL = exports.API_URL = 'https://api.zpush.io/';

/**
 * Force ssl based protocol for network echange
 * Cross Env (Browser/Node) test
 * @access private
 * @type boolean
 */
var FORCE_HTTPS = exports.FORCE_HTTPS = typeof location === 'undefined' ? true : location.protocol === HTTPS_PROTOCOL;

/**
 * @access private
 * @param {string} apiUrl
 * @return {string}
 */
var normalizeApiUrl = function normalizeApiUrl(apiUrl) {
  var last = apiUrl.charAt(apiUrl.length - 1);
  var SLASH = '/';
  return last === SLASH ? apiUrl : apiUrl + SLASH;
};

/**
 * @access private
 * @param {Array<Object>} list
 * @return {Object}
 */
var shuffle = exports.shuffle = function shuffle(list) {
  var index = Math.floor(Math.random() * list.length);
  return list[index];
};

/**
 * @access private
 * @param {string} url
 * @param {boolean} forceHttps
 * @return {string}
 */
var getSecureUrl = exports.getSecureUrl = function getSecureUrl(url, forceHttps) {
  return forceHttps ? url.replace(HTTP_PATTERN, HTTPS_PROTOCOL + '//') : url;
};

/**
 * @access private
 * @param {{apiUrl: string, sandboxId: string, forceHttps: boolean, transports: Transports}} parameters
 * @return {Promise}
 */
var getServers = exports.getServers = function getServers(_ref) {
  var apiUrl = _ref.apiUrl,
      sandboxId = _ref.sandboxId,
      forceHttps = _ref.forceHttps,
      transports = _ref.transports;

  var normalizedSecuresApiUrl = normalizeApiUrl(getSecureUrl(apiUrl, forceHttps));
  var url = '' + normalizedSecuresApiUrl + sandboxId;
  var options = { protocol: forceHttps ? HTTPS_PROTOCOL : HTTP_PROTOCOL };
  return transports.fetch(url, options).then(function (response) {
    return response.json();
  })
  // TODO: Replace by a server side implementation when available
  .then(function (_ref2) {
    var servers = _ref2.servers;
    return servers.map(function (server) {
      return getSecureUrl(server, forceHttps);
    });
  });
};

/**
 * @access private
 * @param Class Derived
 * @param Class Parent
 * @return {boolean}
 */
var isDerivedOf = exports.isDerivedOf = function isDerivedOf(Derived, Parent) {
  var prototype = Object.getPrototypeOf(Derived);
  var is = false;
  while (!(is || prototype === null)) {
    is = prototype === Parent;
    prototype = Object.getPrototypeOf(prototype);
  }
  return is;
};

/**
 * Get random id
 * @return {string}
 */
var uuid = exports.uuid = function uuid() {
  var entropy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 7;
  var dictionary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DICTIONARY;
  return Array.from(Array(entropy)).reduce(function (previous) {
    var next = dictionary.charAt(Math.floor(Math.random() * dictionary.length));
    return '' + previous + next;
  }, '');
};