/**
 * ZetaPush deployables names
 */
const DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
}

/**
 * @access public
 */
export class AbstractHandshakeManager {
  /**
   *
   */
  constructor({ authType, businessId, deploymentId }) {
    this.authType = authType
    this.businessId = businessId
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
 * @access public
 * @extends {AbstractHandshakeManager}
 */
export class TokenHandshakeManager extends AbstractHandshakeManager {
  /**
   *
   */
  constructor({ authType, deploymentId, token }) {
    super({ deploymentId, authType })
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
 * @access public
 * @extends {AbstractHandshakeManager}
 */
export class DefaultZetapushHandshakeManager extends AbstractHandshakeManager {

  /**
   *
   */
  constructor({ authType, deploymentId, login, password }) {
    super({ authType, deploymentId })
    this.login = login
    this.password = password
  }
  /**
   * @desc Get auth data
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
 * @access public
 */
export class AuthentFactory {
  /**
   * @return {DefaultZetapushHandshakeManager}
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
   * @return {TokenHandshakeManager|DefaultZetapushHandshakeManager}
   */
  static createHandshake({ authType, deploymentId, login, password }) {
    if (null === password) {
      return new TokenHandshakeManager({ authType, deploymentId, token: login })
    }
    return new DefaultZetapushHandshakeManager({ authType, deploymentId, login, password  })
  }

}
