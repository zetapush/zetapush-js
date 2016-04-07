import { ClientHelper } from './client-helper'

import { NotYetImplementedError } from './utils'

/**
 * @access public
 * @desc Default ZetaPush API URL
 */
export const API_URL = 'https://api.zpush.io/'

/**
 * @access public
 * @desc ZetaPush Client to connect
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
 */
export class Client {
  /**
   *
   */
  constructor({ apiUrl = API_URL, businessId, handshakeStrategy, resource = null }) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.client = new ClientHelper({
      apiUrl,
      businessId,
      handshakeStrategy,
      resource
    })
  }
  /**
   * @desc Connect client to ZetaPush
   */
  connect() {
    this.client.connect()
  }
  /**
   * @desc Disonnect client from ZetaPush
   */
  disconnect() {
    this.client.disconnect()
  }
  /**
   * @desc Create a service publisher based on publisher definition for the given deployment id
   * @experimental
   * @return {Object}
   */
  createServicePublisher({ deploymentId, publisherDefinition }) {
    return this.client.createServicePublisher(`/service/${this.getBusinessId()}/${deploymentId}`, publisherDefinition)
  }
  /**
   * @desc Get the client business id
   * @return {string}
   */
  getBusinessId() {
    return this.client.getBusinessId()
  }
  /**
   * @desc Get the client resource
   * @return {string}
   */
  getResource() {
    return this.client.getResource()
  }
  /**
   * @desc Get the client user id
   * @return {string}
   */
  getUserId() {
    return this.client.getUserId()
  }
  /**
   * @desc Get the client session id
   * @return {string}
   */
  getSessionId() {
    return this.client.getSessionId()
  }
  /**
   * @desc Subscribe all methods described in the serviceListener for the given deploymentId
   * @return {Object} subscription
   * @example
   * const stackServiceListener = {
   *   list() {},
   *   push() {},
   *   update() {}
   * }
   * client.subscribeListener({
   *   deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>',
   *   serviceListener
   * })
   */
  subscribeListener({ deploymentId, serviceListener }) {
    return this.client.subscribe(`/service/${this.getBusinessId()}/${deploymentId}`, serviceListener)
  }
  /**
  * @desc Create a publish/subscribe
  * @experimental
  * @return {Object}
   */
  createPubSub({ deploymentId, serviceListener, publisher }) {
    throw new NotYetImplementedError('createPubSub')
  }
  /**
   * @desc Set new client resource value
   */
  setResource(resource) {
    this.client.setResource(resource)
  }
  /**
   * @desc Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   */
  addConnectionStatusListener(listener) {
    return this.client.addConnectionStatusListener(listener)
  }
  /**
   * @desc Force disconnect/connect with new handshake factory
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
   * @desc Get a service lister from methods list with a default handler
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
