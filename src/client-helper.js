import { CometD, WebSocketTransport } from 'zetapush-cometd'
import { FetchLongPollingTransport } from './cometd'
import { getServers, shuffle } from './utils'
import { ConnectionStatusListener } from './connection-status'

/**
 * @desc CometD Messages enumeration
 */
const Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
}

/**
 * @desc CometD Transports enumeration
 */
const Transport = {
  LONG_POLLING: 'long-polling',
  WEBSOCKET: 'websocket'
}

/**
 * @desc Provide utilities and abstraction on CometD Transport layer
 * @access private
 */
export class ClientHelper {
  /**
   *
   */
  constructor({ apiUrl, businessId, handshakeStrategy, resource }) {
    /**
     * @access private
     * @type {string}
     */
    this.businessId = businessId
    /**
     * @access private
     * @type {function():AbstractHandshakeManager}
     */
    this.handshakeStrategy = handshakeStrategy
    /**
     * @access private
     * @type {string}
     */
    this.resource = resource
    /**
     * @access private
     * @type {Promise}
     */
    this.servers = getServers(`${apiUrl}${businessId}`)
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.connectionListeners = []
    /**
     * @access private
     * @type {boolean}
     */
    this.connected = false
    /**
     * @access private
     * @type {boolean}
     */
    this.wasConnected = false
    /**
     * @access private
     * @type {string}
     */
    this.serverUrl = null
    /**
     * @access private
     * @type {CometD}
     */
    this.cometd = new CometD()
    this.cometd.registerTransport(Transport.WEBSOCKET, new WebSocketTransport())
    this.cometd.registerTransport(Transport.LONG_POLLING, new FetchLongPollingTransport())
    this.cometd.onTransportException = (cometd, transport) => {
      if (Transport.LONG_POLLING === transport) {
        // Try to find an other available server
        // Remove the current one from the _serverList array
        this.updateServerUrl()
      }
    }
    this.cometd.addListener('/meta/handshake', ({ ext, successful, advice, error }) => {
      console.debug('ClientHelper::/meta/handshake', { ext, successful, advice, error })
      if (successful) {
        const { authentication = null } = ext
        this.initialized(authentication)
      }
      else {
        // this.handshakeFailure(error)
      }
    })

    this.cometd.addListener('/meta/handshake', ({ advice, error, ext, successful }) => {
      console.debug('ClientHelper::/meta/handshake', { ext, successful, advice, error })
      // AuthNegotiation
      if (!successful) {
        if (advice === null) {
          return
        }
        if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
          this.authenticationFailed(error)
        }
        else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
          this.negotiate(ext)
        }
      }
    })

    this.cometd.addListener('/meta/connect', ({ advice, channel, successful }) => {
      console.debug('ClientHelper::/meta/connect', { advice, channel, successful })
      // ConnectionListener
      if (this.cometd.isDisconnected()) {
        this.connected = false
        this.connectionClosed()
      } else {
        this.wasConnected = this.connected
        this.connected = successful
        if (!this.wasConnected && this.connected) {
          this.connectionEstablished()
        }
        else if (this.wasConnected && !this.connected) {
          this.connectionBroken()
        }
      }
    })
  }
  /**
   * @desc Connect client using CometD Transport
   */
  connect() {
    this.servers.then((servers) => {
      this.serverUrl = shuffle(servers)

      this.cometd.configure({
        url: `${this.serverUrl}/strd`,
        backoffIncrement: 1000,
        maxBackoff: 60000,
        appendMessageTypeToURL: false
      })

      this.cometd.handshake(this.getHandshakeFields())
    })
  }
  /**
   * @desc Notify listeners when connection is established
   */
  connectionEstablished() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionEstablished()
    })
  }
  /**
   * @desc Notify listeners when connection is broken
   */
  connectionBroken() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionBroken()
    })
  }
  /**
   * @desc Notify listeners when a message is lost
   */
  messageLost(channel, data) {
    this.connectionListeners.forEach((listener) => {
      listener.onMessageLost(channel, data)
    })
  }
  /**
   * @desc Notify listeners when connection is closed
   */
  connectionClosed() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionClosed()
    })
  }
  /**
   * @desc Notify listeners when connection is established
   */
  initialized(authentication) {
    if (authentication) {
      this.userId = authentication.userId
    }
    this.connectionListeners.forEach((listener) => {
      listener.onSuccessfulHandshake(authentication)
    })
  }
  /**
   * @desc Notify listeners when handshake step succeed
   */
  authenticationFailed(error) {
    this.connectionListeners.forEach((listener) => {
      listener.onFailedHandshake(error)
    })
  }
  /**
   *
   */
  handshakeFailure() {

  }
  /**
  * @desc Remove current server url from the server list and shuffle for another one
  */
  updateServerUrl() {
    this.servers.then((servers) => {
      const index = servers.indexOf(this.serverUrl)
      if (index > -1) {
        servers.splice(index, 1)
      }
      if (servers.length === 0) {
        // No more server available
      }
      else {
        this.serverUrl = shuffle(servers)
        this.cometd.configure({
          url: `${this.serverUrl}/strd`
        })
        setTimeout(() => {
          this.cometd.handshake(this.getHandshakeFields())
        }, 250)
      }
    })
  }
  /**
   *
   */
  negotiate(ext) {
    console.debug('ClientHelper::negotiate', ext)
  }
  /**
   * @desc Disconnect CometD client
   */
  disconnect() {
    this.cometd.disconnect()
  }
  /**
   * @desc Get CometD handshake parameters
   * @return {Object}
   */
  getHandshakeFields() {
    const handshake = this.handshakeStrategy()
    return handshake.getHandshakeFields(this)
  }
  /**
   * @desc Set a new handshake factory methods
   * @param {function():AbstractHandshakeManager} handshakeStrategy
   */
  setHandshakeStrategy(handshakeStrategy) {
    this.handshakeStrategy = handshakeStrategy
  }
  /**
   * @desc Get business id
   * @return {string}
   */
  getBusinessId() {
    return this.businessId
  }
  /**
   * @desc Get session id
   * @return {string}
   */
  getSessionId() {
    throw NotYetImplementedError()
  }
  /**
   * @desc Get resource
   * @return {string}
   */
  getResource() {
    return this.resource
  }
  /**
   * @desc Subribe all methods defined in the serviceListener for the given prefixed channel
   * @param {string} prefix - Channel prefix
   * @param {Object} serviceListener
   * @return {Object} subscriptions
   */
  subscribe(prefix, serviceListener) {
    const subscriptions = {}
    for (const method in serviceListener) {
      if (serviceListener.hasOwnProperty(method)) {
        const channel = `${prefix}/${method}`
        subscriptions[method] = this.cometd.subscribe(channel, serviceListener[method])
      }
    }
    return subscriptions
  }
  /**
   * @desc Unsubcribe all subscriptions defined in given subscriptions object
   * @param {Object} subscriptions
   */
  unsubscribe(subscriptions) {
    for (const method in subscriptions) {
      if (subscriptions.hasOwnProperty(method)) {
        this.cometd.unsubscribe(subscriptions[method])
      }
    }
  }
  /**
   * @desc Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   */
  addConnectionStatusListener(listener) {
    const connectionListener = Object.assign(new ConnectionStatusListener(), listener)
    this.connectionListeners.push(connectionListener)
  }

}
