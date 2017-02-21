import { CometD } from 'zetapush-cometd'
import { TransportTypes, TransportLayers } from '../connection/cometd'
import { ConnectionStatusListener } from '../connection/connection-status'
import { Macro } from '../mapping/services'
import { getServers, isDerivedOf, shuffle, uuid } from '../utils/index'

/**
 * CometD Messages enumeration
 * @type {Object}
 */
const Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
}

/**
 * Get all transport types
 * @type {Object[]}
 */
const AllTransports = Object.values(TransportTypes)

/**
 * Delay to update server url
 * @type {integer}
 */
const UPDATE_SERVER_URL_DELAY = 250

/**
 * Default macro channel
 * @type {string}
 */
const DEFAULT_MACRO_CHANNEL = 'completed'

/**
 * Provide utilities and abstraction on CometD Transport layer
 * @access private
 */
export class ClientHelper {
  /**
   * Create a new ZetaPush client helper
   */
  constructor({ apiUrl, sandboxId, forceHttps = false, authentication, resource = null, transports = AllTransports }) {
    /**
     * @access private
     * @type {string}
     */
    this.sandboxId = sandboxId
    /**
     * @access private
     * @type {function():AbstractHandshake}
     */
    this.authentication = authentication
    /**
     * @access private
     * @type {string}
     */
    this.resource = resource
    /**
     * @access private
     * @type {number}
     */
    this.requestId = 0
    /**
     * @access private
     * @type {string}
     */
    this.userId = null
    /**
     * @access private
     * @type {string}
     */
    this.uniqId = uuid()
    /**
     * @access private
     * @type {Promise}
     */
    this.servers = getServers({ apiUrl, sandboxId, forceHttps }).catch((error) => {
      // Notify error in connection to server step
      this.connectionToServerFail(error)
      // Return empty list
      return []
    })
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
     * @type {string}
     */
    this.sessionId = null
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.subscribeQueue = []
    /**
     * @access private
     * @type {CometD}
     */
    this.cometd = new CometD()

    // Filter transports layers
    TransportLayers.filter(({ type }) => {
      return transports.includes(type)
    }).forEach(({ type, Transport }) => {
      this.cometd.registerTransport(type, new Transport())
    })

    // Handle transport exception
    this.cometd.onTransportException = (cometd, transport) => {
      if (TransportTypes.LONG_POLLING === transport) {
        // Try to find an other available server
        // Remove the current one from the _serverList array
        this.updateServerUrl()
      }
    }

    this.cometd.addListener('/meta/handshake', ({ ext, successful, advice, error }) => {
      this.cometd._debug('ClientHelper::/meta/handshake', { ext, successful, advice, error })
      if (successful) {
        const { authentication = null } = ext
        this.initialized(authentication)
      } else {
        this.handshakeFailure(error)
      }
    })

    this.cometd.addListener('/meta/handshake', ({ advice, error, ext, successful }) => {
      this.cometd._debug('ClientHelper::/meta/handshake', { ext, successful, advice, error })
      // AuthNegotiation
      if (!successful) {
        if (typeof advice === 'undefined') {
          return
        }
        if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
          this.authenticationFailed(error)
        } else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
          this.negotiate(ext)
        }
      }
    })

    this.cometd.addListener('/meta/connect', ({ advice, channel, successful }) => {
      this.cometd._debug('ClientHelper::/meta/connect', { advice, channel, successful })
      // ConnectionListener
      if (this.cometd.isDisconnected()) {
        this.connected = false
        // Notify connection will close
        this.connectionWillClose()
      } else {
        this.wasConnected = this.connected
        this.connected = successful
        if (!this.wasConnected && this.connected) {
          this.cometd.batch(this, () => {
            // Unqueue subscriptions
            this.subscribeQueue.forEach(({ prefix, listener, subscriptions }) => {
              this.subscribe(prefix, listener, subscriptions)
            })
          })
          // Notify connection is established
          this.connectionEstablished()
        } else if (this.wasConnected && !this.connected) {
          // Notify connection is broken
          this.connectionBroken()
        }
      }
    })

    this.cometd.addListener('/meta/disconnect', ({ channel, successful }) => {
      this.cometd._debug('ClientHelper::/meta/disconnect', { channel, successful })
      if (this.cometd.isDisconnected()) {
        this.connected = false
        // Notify connection is closed
        this.connectionClosed()
      }
    })
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   * @return {number} handler
   */
  addConnectionStatusListener(listener) {
    this.connectionListeners.push({
      enabled: true,
      listener: Object.assign(new ConnectionStatusListener(), listener)
    })
    return this.connectionListeners.length - 1
  }
  /**
   * Notify listeners when handshake step succeed
   */
  authenticationFailed(error) {
    this.userId = null
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onFailedHandshake(error)
      })
  }
  /**
   * Connect client using CometD Transport
   */
  connect() {
    this.servers.then((servers) => {
      if (servers.length > 0) {
        // Get a random server url
        this.serverUrl = shuffle(servers)
        // Configure CometD
        this.cometd.configure({
          url: `${this.serverUrl}/strd`,
          backoffIncrement: 1000,
          maxBackoff: 60000,
          appendMessageTypeToURL: false
        })
        // Send handshake fields
        this.cometd.handshake(this.getHandshakeFields())
      } else {
        // No servers available
        this.noServerUrlAvailable()
      }
    })
  }
  /**
   * Notify listeners when connection is broken
   */
  connectionBroken() {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionBroken()
      })
  }
  /**
   * Notify listeners when connection is closed
   */
  connectionClosed() {
    this.userId = null
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionClosed()
      })
  }
  /**
   * Notify listeners when connection is established
   */
  connectionEstablished() {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionEstablished()
      })
  }
  /**
   * Notify listeners when connection to server fail
   */
  connectionToServerFail(failure) {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionToServerFail(failure)
      })
  }
  /**
   * Notify listeners when connection will close
   */
  connectionWillClose() {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionWillClose()
      })
  }
  /**
   * Create a promise based macro service
   * @experimental
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createAsyncMacroService({ listener, Type, deploymentId = Type.DEFAULT_DEPLOYMENT_ID }) {
    const prefix = `/service/${this.getSandboxId()}/${deploymentId}`
    const $publish = this.getAsyncMacroPublisher(prefix)
    // Create service by publisher
    return this.createServiceByPublisher({ listener, prefix, Type, $publish })
  }
  /**
   * Create a publish/subscribe service
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createService({ listener, Type, deploymentId = Type.DEFAULT_DEPLOYMENT_ID }) {
    const isMacroType = isDerivedOf(Type, Macro)
    const prefix = `/service/${this.getSandboxId()}/${deploymentId}`
    const $publish = isMacroType ? this.getMacroPublisher(prefix) : this.getServicePublisher(prefix)
    // Create service by publisher
    return this.createServiceByPublisher({ listener, prefix, Type, $publish })
  }
  /**
   * @param {{listener: Object, prefix: string, Type: class, $publish: Function}} parameters
   * @return {Object} service
   */
  createServiceByPublisher({ listener, prefix, Type, $publish }) {
    const service = new Type({ $publish })
    // Store subscription in service instance
    service.$subscriptions = this.subscribe(prefix, listener)
    return service
  }
  /**
   * Disconnect CometD client
   */
  disconnect() {
    this.cometd.disconnect(true)
  }
  /**
   * Get a publisher for a macro service that return a promise
   * @experimental
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getAsyncMacroPublisher(prefix) {
    return (name, parameters, hardFail = false, debug = 1) => {
      const channel = `${prefix}/call`
      const uniqRequestId = this.getUniqRequestId()
      const subscriptions = {}
      return new Promise((resolve, reject) => {
        const handler = ({ data = {} }) => {
          const { result = {}, errors = [], requestId } = data
          if (requestId === uniqRequestId) {
            // Handle errors
            if (errors.length > 0) {
              reject(errors)
            } else {
              resolve(result)
            }
            this.unsubscribe(subscriptions)
          }
        }
        // Create dynamic listener method
        const listener = {
          [name]: handler,
          [DEFAULT_MACRO_CHANNEL]: handler
        }
        // Ad-Hoc subscription
        this.subscribe(prefix, listener, subscriptions)
        // Publish message on channel
        this.publish(channel, {
          debug,
          hardFail,
          name,
          parameters,
          requestId: uniqRequestId
        })
      })
    }
  }
  /**
   * Get client id
   * @return {string} clientId
   */
  getClientId() {
    return this.cometd.getClientId()
  }
  /**
   * Get CometD handshake parameters
   * @return {Object}
   */
  getHandshakeFields() {
    const handshake = this.authentication()
    return handshake.getHandshakeFields(this)
  }
  /**
   * Get a publisher for a macro service
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getMacroPublisher(prefix) {
    return (name, parameters, hardFail = false, debug = 1) => {
      const channel = `${prefix}/call`
      const requestId = this.getUniqRequestId()
      return this.publish(channel, {
        debug,
        hardFail,
        name,
        parameters,
        requestId
      })
    }
  }
  /**
   * Get queued subscription index
   * @return {Object} index
   */
  getQueuedSubscription(subscriptions = {}) {
    const index = this.subscribeQueue.findIndex((element) => subscriptions === element.subscriptions)
    return {
      index,
      queued: index > -1
    }
  }
  /**
   * Get resource
   * @return {string}
   */
  getResource() {
    return this.resource
  }
  /**
   * Get sandbox id
   * @return {string}
   */
  getSandboxId() {
    return this.sandboxId
  }
  /**
   * Get server urls list
   * @return {Promise} servers
   */
  getServers() {
    return this.servers
  }
  /**
   * Get a publisher for a service
   * @param {string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getServicePublisher(prefix) {
    return (method, parameters) => {
      const channel = `${prefix}/${method}`
      return this.publish(channel, parameters)
    }
  }
  /**
   * Get uniq request id
   * @return {string}
   */
  getUniqRequestId() {
    return `${this.getClientId()}:${this.uniqId}:${++this.requestId}`
  }
  /**
   * Get user id
   * @return {string}
   */
  getUserId() {
    return this.userId
  }
  /**
   * Manage handshake failure case
   */
  handshakeFailure() {
    this.userId = null
  }
  /**
   * Notify listeners when connection is established
   */
  initialized(authentication) {
    if (authentication) {
      this.userId = authentication.userId
    }
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onSuccessfulHandshake(authentication)
      })
  }
  /**
   * Is client connected to ZetaPush
   * @return {boolean}
   */
  isConnected() {
    return !this.cometd.isDisconnected()
  }
  /**
   * Notify listeners when a message is lost
   */
  messageLost(channel, data) {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onMessageLost(channel, data)
      })
  }
  /**
   * Negociate authentication
   */
  negotiate(ext) {
    this.cometd._debug('ClientHelper::negotiate', ext)
  }
  /**
   * Notify listeners when no server url available
   */
  noServerUrlAvailable() {
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onNoServerUrlAvailable()
      })
  }
  /**
   * Wrap CometdD publish method
   * @param {String} channel
   * @param {Object} parameters
   * @return {Object}
   */
  publish(channel, parameters = {}) {
    this.cometd.publish(channel, parameters)
    return { channel, parameters }
  }
  /**
   * Remove a connection status listener
   */
  removeConnectionStatusListener(handler) {
    const listener = this.connectionListeners[handler]
    if (listener) {
      listener.enabled = false
    }
  }
  /**
   * Set a new authentication methods
   * @param {function():AbstractHandshake} authentication
   */
  setAuthentication(authentication) {
    this.authentication = authentication
  }
  /**
   * Set logging level for CometD client
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */
  setLogLevel(level) {
    this.cometd.setLogLevel(level)
  }
  /**
   * Subsribe all methods defined in the listener for the given prefixed channel
   * @param {string} prefix - Channel prefix
   * @param {Object} listener
   * @param {Object} subscriptions
   * @return {Object} subscriptions
   */
  subscribe(prefix, listener = {}, subscriptions = {}) {
    const { queued } = this.getQueuedSubscription(subscriptions)
    if (!queued) {
      // Store arguments to renew subscriptions on connection
      this.subscribeQueue.push({ prefix, listener, subscriptions })
    }
    // Subscribe if user is connected
    if (!this.cometd.isDisconnected()) {
      for (let method in listener) {
        if (listener.hasOwnProperty(method)) {
          const channel = `${prefix}/${method}`
          subscriptions[method] = this.cometd.subscribe(channel, listener[method])
        }
      }
    }
    return subscriptions
  }
  /**
  * Remove current server url from the server list and shuffle for another one
  */
  updateServerUrl() {
    this.servers.then((servers) => {
      const index = servers.indexOf(this.serverUrl)
      if (index > -1) {
        servers.splice(index, 1)
      }
      if (servers.length === 0) {
        // No more server available
        this.noServerUrlAvailable()
      } else {
        this.serverUrl = shuffle(servers)
        this.cometd.configure({
          url: `${this.serverUrl}/strd`
        })
        window.setTimeout(() => {
          this.cometd.handshake(this.getHandshakeFields())
        }, UPDATE_SERVER_URL_DELAY)
      }
    })
  }
  /**
   * Remove all subscriptions
   * @param {Object} subscriptions
   */
  unsubscribe(subscriptions = {}) {
    // Unsubscribe
    for (let method in subscriptions) {
      if (subscriptions.hasOwnProperty(method)) {
        const subscription = subscriptions[method]
        this.cometd.unsubscribe(subscription)
      }
    }
    // Remove subscription from queue
    const { index, queued } = this.getQueuedSubscription(subscriptions)
    if (queued) {
      this.subscribeQueue.splice(index, 1)
    }
  }
}
