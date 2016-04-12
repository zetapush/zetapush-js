import { Client } from './client'
import { AuthentFactory } from './handshake'
import { LocalStorageTokenPersistenceStrategy } from './token-persistence'

/**
 * @access protected
 * @extends {Client}
 */
export class SmartClient extends Client {
  /**
   * Create a new ZetaPush smart client
   */
  constructor({
    apiUrl, authenticationDeploymentId, businessId, enableHttps, resource = null,
    TokenPersistenceStrategy = LocalStorageTokenPersistenceStrategy
  }) {
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
    super({ apiUrl , businessId, enableHttps, handshakeStrategy, resource })
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
