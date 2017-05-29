"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Define life cycle connection methods
 * @access public
 */
var ConnectionStatusListener = exports.ConnectionStatusListener = function () {
  function ConnectionStatusListener() {
    _classCallCheck(this, ConnectionStatusListener);
  }

  /**
   * Callback fired when connection is broken
   */
  ConnectionStatusListener.prototype.onConnectionBroken = function onConnectionBroken() {};
  /**
   * Callback fired when connection is closed
   */


  ConnectionStatusListener.prototype.onConnectionClosed = function onConnectionClosed() {};
  /**
   * Callback fired when connection is established
   */


  ConnectionStatusListener.prototype.onConnectionEstablished = function onConnectionEstablished() {};
  /**
   * Callback fired when an error occurs in connection to server step
   * @param {Object} failure
   */


  ConnectionStatusListener.prototype.onConnectionToServerFail = function onConnectionToServerFail(failure) {};
  /**
   * Callback no server url avaibale
   */


  ConnectionStatusListener.prototype.onNoServerUrlAvailable = function onNoServerUrlAvailable() {};
  /**
  * Callback fired when connection will close
  */


  ConnectionStatusListener.prototype.onConnectionWillClose = function onConnectionWillClose() {};
  /**
   * Callback fired when an error occurs in handshake step
   * @param {Object} failure
   */


  ConnectionStatusListener.prototype.onFailedHandshake = function onFailedHandshake(failure) {};
  /**
   * Callback fired when a message is lost
   */


  ConnectionStatusListener.prototype.onMessageLost = function onMessageLost() {};
  /**
   * Callback fired when handshake step succeed
   * @param {Object} authentication
   */


  ConnectionStatusListener.prototype.onSuccessfulHandshake = function onSuccessfulHandshake(authentication) {};

  return ConnectionStatusListener;
}();