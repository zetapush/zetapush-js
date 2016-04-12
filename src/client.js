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
    this.client = new ClientHelper({
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
    this.client.connect()
  }
  /**
   * Disonnect client from ZetaPush
   */
  disconnect() {
    this.client.disconnect()
  }
  /**
   * Create a service publisher based on publisher definition for the given deployment id
   * @return {Object}
   */
  createServicePublisher({ deploymentId, publisherDefinition }) {
    return this.client.createServicePublisher(`/service/${this.getBusinessId()}/${deploymentId}`, publisherDefinition)
  }
  /**
   * Get the client business id
   * @return {string}
   */
  getBusinessId() {
    return this.client.getBusinessId()
  }
  /**
   * Get the client resource
   * @return {string}
   */
  getResource() {
    return this.client.getResource()
  }
  /**
   * Get the client user id
   * @return {string}
   */
  getUserId() {
    return this.client.getUserId()
  }
  /**
   * Get the client session id
   * @return {string}
   */
  getSessionId() {
    return this.client.getSessionId()
  }
  /**
   * Subscribe all methods described in the serviceListener for the given deploymentId
   * @return {Object} subscription
   * @example
   * const stackServiceListener = {
   *   list() {},
   *   push() {},
   *   update() {}
   * }
   * client.subscribe({
   *   deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>',
   *   serviceListener
   * })
   */
  subscribe({ deploymentId, serviceListener }) {
    return this.client.subscribe(`/service/${this.getBusinessId()}/${deploymentId}`, serviceListener)
  }
  /**
   * Create a publish/subscribe
   * @return {Object}
   */
  createPublisherSubscriber({ deploymentId, serviceListener, publisherDefinition }) {
    return {
      subscription: this.subscribe({ deploymentId, serviceListener }),
      publisher: this.createServicePublisher({ deploymentId, publisherDefinition })
    }
  }
  /**
   * Set new client resource value
   */
  setResource(resource) {
    this.client.setResource(resource)
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   */
  addConnectionStatusListener(listener) {
    return this.client.addConnectionStatusListener(listener)
  }
  /**
   * Force disconnect/connect with new handshake factory
   * @param {function():AbstractHandshakeManager} handshakeStrategy
   */
  handshake(handshakeStrategy) {
    this.disconnect()
    if (handshakeStrategy) {
      this.client.setHandshakeStrategy(handshakeStrategy)
    }
    this.connect()
  }

  /**
   * Get a service lister from methods list with a default handler
   * @return {Object} listener
   * @example
   * const getStackServiceListener = () => {
   *   return Client.getServiceListener({
   *     methods: ['getListeners', 'list', 'purge', 'push', 'remove', 'setListeners', 'update', 'error'],
   *     handler: ({ channel, data }) => {
   *       console.debug(`Stack::${method}`, { channel, data })
   *       document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
   *     }
   *   })
   * }
   */
  static getServiceListener({ methods = [], handler = () => {} }) {
    return methods.reduce((listener, method) => {
      listener[method] = ({ channel, data }) => handler({ channel, data, method })
      return listener
    }, {})
  }

}
