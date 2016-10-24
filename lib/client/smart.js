import { Client } from './basic'
import { Authentication } from '../authentication/handshake'
import { SessionPersistenceStrategy } from '../utils/session-persistence'

/**
 * SmartClient config object.
 * @typedef {Object} SmartClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 * @property {Array} transports - Client transports list
 */

/**
 * @access public
 * @extends {Client}
 * @example
 * // Create a new WeakClient
 * const client = new ZetaPush.SmartClient({
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 */
export class SmartClient extends Client {
  /**
   * Create a new ZetaPush SmartClient
   * @param {SmartClientConfig} config
   */
  constructor({ apiUrl, sandboxId, forceHttps, resource, transports }) {
    const persistence = new SessionPersistenceStrategy({ sandboxId })

    /**
     * @return {AbstractHandshakeManager}
     */
    const authentication = () => {
      const session = persistence.get()
      const { token } = session

      if (this.hasCredentials()) {
        const { login, password } = this.getCredentials()
        this.setCredentials({})
        return Authentication.simple({
          login,
          password
        })
      } else {
        if (this.isStronglyAuthenticated(session)) {
          return Authentication.simple({
            login: token,
            password: null
          })
        } else {
          return Authentication.weak({
            token
          })
        }
      }
    }
    // Initialize base client
    super({
      apiUrl, sandboxId, authentication, forceHttps, resource, transports
    })
    /**
     * @access protected
     * @type {SessionPersistenceStrategy}
     */
    this.persistence = persistence
    /**
     * @access protected
     * @type {Object}
     */
    this.credentials = {}
    /**
     * Handle connection lifecycle events
     * @access protected
     * @type {Object}
     */
    this.lifeCycleConnectionHandler = this.addConnectionStatusListener({
      onConnectionClosed() {
        persistence.set({})
      },
      onSuccessfulHandshake(session) {
        if (session.token) {
          persistence.set(session)
        }
      }
    })
    // Properly disconnect client to avoir ghost connections
    window.addEventListener('beforeunload', () => {
      this.removeConnectionStatusListener(this.lifeCycleConnectionHandler)
      super.disconnect()
    })
  }
  /**
   * Disconnect client from ZetaPush backend
   */
  disconnect() {
    super.disconnect()
  }
  /**
   * @return {Object}
   */
  getCredentials() {
    return this.credentials
  }
  /**
   * @return {Object}
   */
  getSession() {
    return this.persistence.get()
  }
  /**
   * @return {boolean}
   */
  hasCredentials() {
    const { login, password } = this.getCredentials()
    return login && password
  }
  /**
   * @return {boolean}
   */
  isStronglyAuthenticated(session = this.persistence.get()) {
    return !this.isWeaklyAuthenticated(session) && typeof session.token === 'string'
  }
  /**
   * @return {boolean}
   */
  isWeaklyAuthenticated(session = this.persistence.get()) {
    return typeof session.publicToken === 'string'
  }
  /**
   * @param {{login: string, password: string}} parameters
   */
  setCredentials({ login, password }) {
    this.credentials = { login, password }
  }
}
