import { API_URL, isHttpsProtocol } from './utils/index'
import { ClientHelper } from './client-helper'
import { ConnectionStatusListener } from './connection/connection-status'

/**
 * Client config object.
 * @typedef {Object} ClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {function():AbstractHandshake} credentials - Return credentials properties
 * @property {string} resource - Client resource id
 * @property {Array} transports - Client transports list
 */

/**
 * ZetaPush Client to connect
 * @access public
 * @example
 * // Securized client with token based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   credentials() {
 *     return ZetaPush.Authentication.weak({
 *       token: null
  *    })
 *   }
 * })
 * @example
 * // Client with credentials based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   credentials() {
 *     return ZetaPush.Authentication.simple({
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
  *    })
 *   }
 * })
 * @example
 * // Explicit deploymentId
 * const clientSimple = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   credentials() {
 *     return ZetaPush.Authentication.simple({
 *       deploymentId: '<YOUR-SIMPLE-AUTHENTICATION-DEPLOYMENT-ID>',
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
 *    })
 *   }
 * })
 * const clientWeak = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   credentials() {
 *     return ZetaPush.Authentication.weak({
 *       deploymentId: '<YOUR-WEAK-AUTHENTICATION-DEPLOYMENT-ID>',
 *       token: '<SESSION-TOKEN>'
 *    })
 *   }
 * })
 */
export class Client {
  /**
   * @param {ClientConfig} config
   * Create a new ZetaPush client
   */
  constructor({ apiUrl = API_URL, sandboxId, forceHttps = isHttpsProtocol(), credentials, resource, transports }) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new ClientHelper({
      apiUrl,
      sandboxId,
      forceHttps,
      credentials,
      resource,
      transports
    })
  }
  /**
   * Is client connected to ZetaPush
   * @return {boolean}
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
   * Remove all subscriptions
   * @param {Object} service
   */
  unsubscribe(service) {
    if (!service.$subscriptions) {
      throw new TypeError('Missing $subscriptions property in service')
    }
    return this.helper.unsubscribe(service.$subscriptions)
  }
  /**
   * Create a publish/subscribe for a service type
   * @param {{type: class, deploymentId: string, listener: Object}} parameters
   * @return {Object} service
   * @example
   * const service = client.createService({
   *   type: ZetaPush.services.Stack,
   *   listener: {
   *     list(message) {
   *       console.log('Stack list callback', message)
   *     },
   *     push(message) {
   *       console.log('Stack push callback', message)
   *     }
   *   }
   * })
   * service.list({
   *   stack: '<STACK-ID>'
   * })
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * const service = client.createService({
   *   deploymentId: 'stack_0',
   *   type: ZetaPush.services.Stack,
   *   listener: {
   *     list(message) {
   *       console.log('Stack list callback', message)
   *     },
   *     push(message) {
   *       console.log('Stack push callback', message)
   *     }
   *   }
   * })
   * service.list({
   *   stack: '<STACK-ID>'
   * })
   */
  createService({ type, listener, deploymentId = type.DEFAULT_DEPLOYMENT_ID }) {
    return this.helper.createService({ deploymentId, listener, type })
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
   * Set logging level
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */
  setLogLevel(level) {
    this.helper.setLogLevel(level)
  }
}

/**
 * Add shorthand connection status method
 */
Object.getOwnPropertyNames(ConnectionStatusListener.prototype).forEach((method) => {
  // Only implements unsupported methods
  if (!Client.prototype.hasOwnProperty(method)) {
    Client.prototype[method] = function addListener(listener) {
      return this.addConnectionStatusListener({
        [method]: listener
      })
    }
  }
})
