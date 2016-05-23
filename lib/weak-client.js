import { Client } from './client'
import { AuthentFactory } from './authentication/handshake'
import { LocalStorageTokenPersistenceStrategy } from './utils/token-persistence'

/**
 * WeakClient config object.
 * @typedef {Object} WeakClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} authenticationDeploymentId - Authentication deployment id
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 * @property {AbstractTokenPersistenceStrategy} TokenPersistenceStrategy - Token storage strategy
 */

/**
 * @access public
 * @extends {Client}
 */
export class WeakClient extends Client {
  /**
   * Create a new ZetaPush smart client
   * @param {WeakClientConfig} config
   * @example
   * // Smart client
   * const client = new ZetaPush.WeakClient({
   *   sandboxId: '<YOUR-SANDBOX-ID-ID>',
   *   authenticationDeploymentId: '<YOUR-AUTHENTICATION-DEPLOYMENT-ID>'
   * })
   */
  constructor({ apiUrl, authenticationDeploymentId, sandboxId, forceHttps, resource = null, TokenPersistenceStrategy = LocalStorageTokenPersistenceStrategy }) {
    const handshakeStrategy = () => {
      const token = this.getToken()
      const handshake = AuthentFactory.createWeakHandshake({
        deploymentId: authenticationDeploymentId,
        token
      })
      return handshake
    }
    /**
     *
     */
    super({ apiUrl , sandboxId, forceHttps, handshakeStrategy, resource })
    const onSuccessfulHandshake = ({ publicToken, userId, token }) => {
      console.debug('WeakClient::onSuccessfulHandshake', { publicToken, userId, token })

      if (token) {
        this.strategy.set({ token })
      }
    }
    const onFailedHandshake = (error) => {
      console.debug('WeakClient::onFailedHandshake', error)
    }
    this.addConnectionStatusListener({ onFailedHandshake, onSuccessfulHandshake })
    /**
     * @access private
     * @type {TokenPersistenceStrategy}
     */
    this.strategy = new TokenPersistenceStrategy()
  }
  /**
   * @return {string} The stored token
   */
  getToken() {
    return this.strategy.get()
  }
}
