/**
 * Define life cycle connection methods 
 * @access public
 */
export class ConnectionStatusListener {
  /**
   * Callback fired when connection is broken
   */
  onConnectionBroken() {}
  /**
   * Callback fired when connection is closed
   */
  onConnectionClosed() {}
  /**
   * Callback fired when is established
   */
  onConnectionEstablished() {}
  /**
   * Callback fired when an error occurs in handshake step
   * @param {Object} error
   */
  onFailedHandshake(error) {}
  /**
   * Callback fired when a message is lost
   */
  onMessageLost() {}
  /**
   * Callback fired when handshake step succeed
   * @param {Object} authentication
   */
  onSuccessfulHandshake(authentication) {}
}
