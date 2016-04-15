import { ClientHelper } from './client-helper'

import { NotYetImplementedError } from './utils'

/**
 * Default ZetaPush API URL
 * @access public
 */
export const API_URL = 'https://api.zpush.io/'

/**
 * ZetaPush Client to connect
 * @access public
 * @example
 * const client = new Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   handshakeStrategy() {
 *     return AuthentFactory.createWeakHandshake({
 *       token: null,
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 * @example
 * const client = new Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   enableHttps: true,
 *   handshakeStrategy() {
 *     return AuthentFactory.createWeakHandshake({
 *       token: null,
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 */
export class Client {
  /**
   * Create a new ZetaPush client
   */
  constructor({ apiUrl = API_URL, businessId, enableHttps = false, handshakeStrategy, resource = null }) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new ClientHelper({
      apiUrl,
      businessId,
      enableHttps,
      handshakeStrategy,
      resource
    })
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
   * Create a service publisher based on publisher definition for the given deployment id
   * @return {Object}
   */
  createServicePublisher({ deploymentId, definition }) {
    return this.helper.createServicePublisher(`/service/${this.getBusinessId()}/${deploymentId}`, definition)
  }
  /**
   * Get the client business id
   * @return {string}
   */
  getBusinessId() {
    return this.helper.getBusinessId()
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
    return this.helper.subscribe(`/service/${this.getBusinessId()}/${deploymentId}`, listener)
  }
  /**
   * Create a publish/subscribe
   * @return {Object}
   */
  createPublisherSubscriber({ deploymentId, listener, definition }) {
    return {
      subscription: this.subscribe({ deploymentId, listener }),
      publisher: this.createServicePublisher({ deploymentId, definition })
    }
  }
  /**
   * Set new client resource value
   */
  setResource(resource) {
    this.helper.setResource(resource)
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   */
  addConnectionStatusListener(listener) {
    return this.helper.addConnectionStatusListener(listener)
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
   * Get a service lister from methods list with a default handler
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
