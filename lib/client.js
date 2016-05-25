import { API_URL } from './utils/index'
import { ClientHelper } from './client-helper'
import { NotYetImplementedError } from './utils/index'

/**
 * Client config object.
 * @typedef {Object} ClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {function():AbstractHandshakeManager} handshakeStrategy - Handshake strategy
 * @property {string} resource - Client resource id
 */

/**
 * ZetaPush Client to connect
 * @access public
 * @example
 * // Securized client with token based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   forceHttps: true,
 *   handshakeStrategy: function() {
 *     return ZetaPush.AuthentFactory.createWeakHandshake({
 *       token: null,
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 * @example
 * // Client with credentials based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   handshakeStrategy: function() {
 *     return ZetaPush.AuthentFactory.createSimpleHandshake({
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>',
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 */
export class Client {
  /**
   * @param {ClientConfig} config
   * Create a new ZetaPush client
   */
  constructor({ apiUrl = API_URL, sandboxId, forceHttps = false, handshakeStrategy, resource = null }) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new ClientHelper({
      apiUrl,
      sandboxId,
      forceHttps,
      handshakeStrategy,
      resource
    })
  }
  /**
   * Is client connected to ZetaPush
   * @return boolean
   */
  isConnected() {
    return this.helper.isConnected()
  }
  /**
   * Connect client to ZetaPush
   */
  connect() {
    this.helper.connect()
  }
  /**
   * Disonnect client from ZetaPush
   */
  disconnect() {
    this.helper.disconnect()
  }
  /**
   * Create a macro publisher based on publisher definition for the given deployment id
   * @param {{deploymentId: string, definition: class}} parameters
   * @return {Object}
   */
  createMacroPublisher({ deploymentId, definition }) {
    return this.helper.createMacroPublisher(`/service/${this.getSandboxId()}/${deploymentId}`, definition)
  }
  /**
   * Create a service publisher based on publisher definition for the given deployment id
   * @param {{deploymentId: string, definition: class}} parameters
   * @return {Object}
   */
  createServicePublisher({ deploymentId, definition }) {
    return this.helper.createServicePublisher(`/service/${this.getSandboxId()}/${deploymentId}`, definition)
  }
  /**
   * Get the client sandbox id
   * @return {string}
   */
  getSandboxId() {
    return this.helper.getSandboxId()
  }
  /**
   * Get the client resource
   * @return {string}
   */
  getResource() {
    return this.helper.getResource()
  }
  /**
   * Get the client user id
   * @return {string}
   */
  getUserId() {
    return this.helper.getUserId()
  }
  /**
   * Get the client session id
   * @return {string}
   */
  getSessionId() {
    return this.helper.getSessionId()
  }
  /**
   * Subscribe all methods described in the listener for the given deploymentId
   * @param {{deploymentId: string, listener: Object}} parameters
   * @return {Object} subscription
   * @example
   * const stackServiceListener = {
   *   list() {},
   *   push() {},
   *   update() {}
   * }
   * client.subscribe({
   *   deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>',
   *   listener: stackServiceListener
   * })
   */
  subscribe({ deploymentId, listener }) {
    return this.helper.subscribe(`/service/${this.getSandboxId()}/${deploymentId}`, listener)
  }
  /**
   * Remove all subscriptions
   * @param {Object} subscriptions
   */
  unsubscribe(subscriptions = {}) {
    return this.helper.unsubscribe(subscriptions)
  }
  /**
   * Create a publish/subscribe for a macro definition
   * @param {{deploymentId: string, listener: Object, definition: class}} parameters
   * @return {{publisher: Object, subscriptions: Object}}
   */
  createMacroPublisherSubscriber({ deploymentId, listener, definition }) {
    return {
      publisher: this.createMacroPublisher({ deploymentId, definition }),
      subscriptions: this.subscribe({ deploymentId, listener })
    }
  }
  /**
   * Create a publish/subscribe for a service definition
   * @param {{deploymentId: string, listener: Object, definition: class}} parameters
   * @return {{publisher: Object, subscriptions: Object}}
   */
  createServicePublisherSubscriber({ deploymentId, listener, definition }) {
    return {
      publisher: this.createServicePublisher({ deploymentId, definition }),
      subscriptions: this.subscribe({ deploymentId, listener })
    }
  }
  /**
   * Set new client resource value
   * @param {string} resource
   */
  setResource(resource) {
    this.helper.setResource(resource)
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   * @return {number} handler
   */
  addConnectionStatusListener(listener) {
    return this.helper.addConnectionStatusListener(listener)
  }
  /**
   * Remove a connection status listener
   * @param {number} handler
   */
  removeConnectionStatusListener(handler) {
    return this.helper.removeConnectionStatusListener(handler)
  }
  /**
   * Force disconnect/connect with new handshake factory
   * @param {function():AbstractHandshakeManager} handshakeStrategy
   */
  handshake(handshakeStrategy) {
    this.disconnect()
    if (handshakeStrategy) {
      this.helper.setHandshakeStrategy(handshakeStrategy)
    }
    this.connect()
  }
  /**
   * Set logging level
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */
  setLogLevel(level) {
    this.helper.setLogLevel(level)
  }

  /**
   * Get a service lister from methods list with a default handler
   * @access private
   * @param {{methods: Array<function>, handler: function}} params
   * @return {Object} listener
   * @example
   * const getStackServiceListener = () => {
   *   return Client.getGenericServiceListener({
   *     methods: ['getListeners', 'list', 'purge', 'push', 'remove', 'setListeners', 'update', 'error'],
   *     handler: ({ channel, data }) => {
   *       console.debug(`Stack::${method}`, { channel, data })
   *       document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
   *     }
   *   })
   * }
   */
  static getGenericServiceListener({ methods = [], handler = () => {} }) {
    return methods.reduce((listener, method) => {
      listener[method] = ({ channel, data }) => handler({ channel, data, method })
      return listener
    }, {})
  }

}
