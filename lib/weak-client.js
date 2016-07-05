import { Client } from './client'
import { AuthentFactory } from './authentication/handshake'
import { LocalStorageTokenPersistenceStrategy } from './utils/token-persistence'

/**
 * WeakClient config object.
 * @typedef {Object} WeakClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} deploymentId - Authentication deployment id
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 */

/**
 * @access public
 * @extends {Client}
 * @example
 * // Create a new WeakClient
 * const client = new ZetaPush.WeakClient({
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 */
export class WeakClient extends Client {
  /**
   * Create a new ZetaPush smart client
   * @param {WeakClientConfig} config
   */
  constructor({ apiUrl, sandboxId, deploymentId, forceHttps, resource }) {
    const credentials = () => {
      const token = this.getToken()
      const handshake = AuthentFactory.createWeakHandshake({
        deploymentId,
        token
      })
      return handshake
    }
    /**
     * Call Client constructor with specific parameters
     */
    super({ apiUrl , sandboxId, forceHttps, credentials, resource })
    const onSuccessfulHandshake = ({ publicToken, userId, token }) => {
      if (token) {
        this.strategy.set({ token })
      }
    }
    this.addConnectionStatusListener({ onSuccessfulHandshake })
    /**
     * @access private
     * @type {TokenPersistenceStrategy}
     */
    this.strategy = new LocalStorageTokenPersistenceStrategy()
  }
  /**
   * @return {string} The stored token
   */
  getToken() {
    return this.strategy.get()
  }
}