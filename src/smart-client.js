import { Client } from './client'
import { AuthentFactory } from './authentication/handshake'
import { LocalStorageTokenPersistenceStrategy } from './utils/token-persistence'

/**
 * SmartClient config object.
 * @typedef {Object} SmartClientConfig
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
export class SmartClient extends Client {
  /**
   * Create a new ZetaPush smart client
   * @param {SmartClientConfig} config
   * @example
   * // Smart client
   * const client = new ZetaPush.SmartClient({
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
      console.debug('SmartClient::onSuccessfulHandshake', { publicToken, userId, token })

      if (token) {
        this.strategy.set({ token })
      }
    }
    const onFailedHandshake = (error) => {
      console.debug('SmartClient::onFailedHandshake', error)
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
