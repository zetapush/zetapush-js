import { Client } from './client'
import { AuthentFactory } from './handshake'
import { LocalStorageTokenPersistenceStrategy } from './token-persistence'

/**
 *
 */
export class SmartClient extends Client {
  /**
   *
   */
  constructor({ apiUrl, businessId, deploymentId, resource = null, TokenPersistenceStrategy = LocalStorageTokenPersistenceStrategy }) {
    const handshakeFactory = () => {
      const token = this.getToken()
      const handshake = AuthentFactory.createWeakHandshake({
        deploymentId,
        token
      })
      return handshake
    }
    /**
     *
     */
    super({ apiUrl , businessId, handshakeFactory, resource })
    const onSuccessfulHandshake = ({ publicToken, userId, token }) => {
      console.debug('SmartClient::onSuccessfulHandshake', { publicToken, userId, token })

      if (token) {
        this.strategy.set({ token })
      }
    }
    const onFailedHandshake = (error) => {
      console.debug('SmartClient::onFailedHandshake', error)
    }
    this.client.addConnectionStatusListener({ onFailedHandshake, onSuccessfulHandshake })
    this.strategy = new TokenPersistenceStrategy()
  }
  /**
   *
   */
  getToken() {
    return this.strategy.get()
  }
}
