/**
 * @access public
 */
export class ConnectionStatusListener {
  /**
   * @desc Callback fired when connection is broken
   */
  onConnectionBroken() {}
  /**
   * @desc Callback fired when connection is closed
   */
  onConnectionClosed() {}
  /**
   * @desc Callback fired when is established
   */
  onConnectionEstablished() {}
  /**
   * @desc Callback fired when an error occurs in handshake step
   * @param {Object} error
   */
  onFailedHandshake(error) {}
  /**
   * @desc Callback fired when a message is lost
   */
  onMessageLost() {}
  /**
   * @desc Callback fired when handshake step succeed
   * @param {Object} authentication
   */
  onSuccessfulHandshake(authentication) {}
}
