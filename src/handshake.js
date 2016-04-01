const DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
}

class AbstractHandshakeManager {
  constructor({ businessId, deploymentId, authType }) {
    this.businessId = businessId
    this.deploymentId = deploymentId
    this.authType = authType
  }

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

  get authVersion() {
    return 'none'
  }
}

class TokenHandshakeManager extends AbstractHandshakeManager {
  constructor({ token, deploymentId, authType }) {
    super({ deploymentId, authType })
    this.token = token
  }

  get authData() {
    const { token } = this
    return {
      token
    }
  }
}

class DefaultZetapushHandshakeManager extends AbstractHandshakeManager {
  constructor({ login, password, deploymentId, authType }) {
    super({ deploymentId, authType })
    this.login = login
    this.password = password
  }

  get authData() {
    const { login, password } = this
    return {
      login, password
    }
  }
}

export class AuthentFactory {

  static createSimpleHandshake({ login, password, deploymentId }) {
    return AuthentFactory.createHandshake({
      login,
      password,
      deploymentId,
      authType: DeployableNames.AUTH_SIMPLE
    })
  }

  static createWeakHandshake({ token, deploymentId }) {
    return AuthentFactory.createHandshake({
      login: token,
      password: null,
      deploymentId,
      authType: DeployableNames.AUTH_WEAK
    })
  }

  static createDelegatingHandshake({ token, deploymentId }) {
    return AuthentFactory.createHandshake({
      login: token,
      password: null,
      deploymentId,
      authType: DeployableNames.AUTH_DELEGATING
    })
  }

  static createHandshake({ login, password, deploymentId, authType }) {
    if (null === password) {
      return new TokenHandshakeManager({ token: login, deploymentId, authType })
    }
    return new DefaultZetapushHandshakeManager({ login, password, deploymentId, authType })
  }
}
