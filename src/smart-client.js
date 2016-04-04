import { Client } from './client'
import { AuthentFactory } from './handshake'
import { LocalStorageTokenPersistenceStrategy } from './token-persistence'

/**
 *
 */
export class SmartClient {
  /**
   *
   */
  constructor({ apiUrl, businessId, deploymentId, TokenPersistenceStrategy = LocalStorageTokenPersistenceStrategy }) {
    this.strategy = new TokenPersistenceStrategy()
    const handshake = this.getHandshake({ deploymentId })
    const onSuccessfulHandshake = ({ publicToken, userId, token }) => {
      console.debug('SmartClient::onSuccessfulHandshake', { publicToken, userId, token })

      if (token) {
        this.strategy.set({ token })
      }
    }
    const onFailedHandshake = (error) => {
      console.debug('SmartClient::onFailedHandshake', error)
    }
    this.client = new Client({ apiUrl, businessId, handshake })
    this.addConnectionStatusListener({ onFailedHandshake, onSuccessfulHandshake })
  }
  /**
   *
   */
  addConnectionStatusListener(listener) {
    this.client.addConnectionStatusListener(listener)
  }
  /**
   *
   */
  disconnect() {
    this.client.disconnect()
  }
  /**
   *
   */
  connect() {
    this.client.connect()
  }
  /**
   *
   */
  getHandshake({ deploymentId }) {
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
  getToken() {
    return this.strategy.get()
  }

}
