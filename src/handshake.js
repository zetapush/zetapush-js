/**
 *
 */
const DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
}

/**
 *
 */
class AbstractHandshakeManager {
  /**
   *
   */
  constructor({ authType, businessId, deploymentId }) {
    this.authType = authType
    this.businessId = businessId
    this.deploymentId = deploymentId
  }
  /**
   *
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
   *
   */
  get authVersion() {
    return 'none'
  }

}

/**
 *
 */
class TokenHandshakeManager extends AbstractHandshakeManager {
  /**
   *
   */
  constructor({ authType, deploymentId, token }) {
    super({ deploymentId, authType })
    this.token = token
  }
  /**
   *
   */
  get authData() {
    const { token } = this
    return {
      token
    }
  }

}

/**
 *
 */
class DefaultZetapushHandshakeManager extends AbstractHandshakeManager {

  /**
   *
   */
  constructor({ authType, deploymentId, login, password }) {
    super({ authType, deploymentId })
    this.login = login
    this.password = password
  }
  /**
   *
   */
  get authData() {
    const { login, password } = this
    return {
      login, password
    }
  }

}

/**
 *
 */
export class AuthentFactory {
  /**
   *
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
   *
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
   *
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
   *
   */
  static createHandshake({ authType, deploymentId, login, password }) {
    if (null === password) {
      return new TokenHandshakeManager({ authType, deploymentId, token: login })
    }
    return new DefaultZetapushHandshakeManager({ authType, deploymentId, login, password  })
  }

}
