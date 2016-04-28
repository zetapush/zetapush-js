/**
 * ZetaPush deployables names
 */
const DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
}

/**
 * Provide abstraction over CometD handshake data structure
 * @access public
 */
export class AbstractHandshakeManager {
  /**
   * Create a new handshake manager
   * @param {{authType: string, businessId: string, deploymentId: string}} parameters
   */
  constructor({ authType, businessId, deploymentId }) {
    /**
     * @access protected
     * @type {string}
     */
    this.authType = authType
    /**
     * @access protected
     * @type {string}
     */
    this.businessId = businessId
    /**
     * @access protected
     * @type {string}
     */
    this.deploymentId = deploymentId
  }
  /**
   * @param {ClientHelper} client
   * @return {Object}
   */
  getHandshakeFields(client) {
    const authentication = {
      data: this.authData,
      type: `${client.getBusinessId()}.${this.deploymentId}.${this.authType}`,
      version: this.authVersion
    }
    if (client.getResource()) {
      authentication.resource = client.getResource()
    }
    return {
      ext: {
        authentication
      }
    }
  }
  /**
   * Get auth version
   * @return {string}
   */
  get authVersion() {
    return 'none'
  }

}

/**
 * Provide abstraction over CometD token base handshake data structure
 * @access public
 * @extends {AbstractHandshakeManager}
 */
export class TokenHandshakeManager extends AbstractHandshakeManager {
  /**
   * @param {{authType: string, deploymentId: string, token: string}} parameters
   */
  constructor({ authType, deploymentId, token }) {
    super({ deploymentId, authType })
    /**
     * @access private
     * @type {string}
     */
    this.token = token
  }
  /**
   * @return {token: string}
   */
  get authData() {
    const { token } = this
    return {
      token
    }
  }

}

/**
 * Provide abstraction over CometD credentials based handshake data structure
 * @access public
 * @extends {AbstractHandshakeManager}
 */
export class CredentialsHandshakeManager extends AbstractHandshakeManager {

  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   */
  constructor({ authType, deploymentId, login, password }) {
    super({ authType, deploymentId })
    /**
     * @access private
     * @type {string}
     */
    this.login = login
    /**
     * @access private
     * @type {string}
     */
    this.password = password
  }
  /**
   * Get auth data
   * @return {login: string, password: string}
   */
  get authData() {
    const { login, password } = this
    return {
      login, password
    }
  }

}

/**
 * Factory to create handshake
 * @access public
 */
export class AuthentFactory {
  /**
   * @param {{deploymentId: string, login: string, password: string}} parameters
   * @return {CredentialsHandshakeManager}
   */
  static createSimpleHandshake({ deploymentId, login, password }) {
    return AuthentFactory.createHandshake({
      authType: DeployableNames.AUTH_SIMPLE,
      deploymentId,
      login,
      password
    })
  }
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshakeManager}
   */
  static createWeakHandshake({ deploymentId, token }) {
    return AuthentFactory.createHandshake({
      authType: DeployableNames.AUTH_WEAK,
      deploymentId,
      login: token,
      password: null
    })
  }
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshakeManager}
   */
  static createDelegatingHandshake({ deploymentId, token }) {
    return AuthentFactory.createHandshake({
      authType: DeployableNames.AUTH_DELEGATING,
      deploymentId,
      login: token,
      password: null
    })
  }
  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   * @return {TokenHandshakeManager|CredentialsHandshakeManager}
   */
  static createHandshake({ authType, deploymentId, login, password }) {
    if (null === password) {
      return new TokenHandshakeManager({ authType, deploymentId, token: login })
    }
    return new CredentialsHandshakeManager({ authType, deploymentId, login, password  })
  }

}
