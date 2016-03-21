import { LongPollingTransport } from './cometd'
import { getServers, shuffle } from './utils'

const Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
}

const Transport = {
  LONG_POLLING: 'long-polling',
  WEBSOCKET: 'websocket'
}

class ConnectionStatusListener {
  onSuccessfulHandshake() {}

  onFailedHandshake() {}

  onConnectionEstablished() {}

  onConnectionBroken() {}

  onConnectionClosed() {}

  onMessageLost() {}
}

export class ClientHelper {
  constructor({ apiUrl, businessId, handshake, resource }) {
    this.businessId = businessId
    this.handshake = handshake
    this.resource = resource
    this.servers = getServers(`${apiUrl}${businessId}`)
    this.connectionListeners = []
    this.connected = false
    this.wasConnected = false
    this.serverUrl = null
    this.cometd = new org.cometd.CometD()
    this.cometd.registerTransport(Transport.WEBSOCKET, new org.cometd.WebSocketTransport())
    this.cometd.registerTransport(Transport.LONG_POLLING, new LongPollingTransport())
    this.cometd.onTransportException = (cometd, transport) => {
      if (Transport.LONG_POLLING === transport) {
        // Try to find an other available server
        // Remove the current one from the _serverList array
        this.handshakeFailure()
      }
    }
  }
  connect() {
    this.servers.then((servers) => {
      this.serverUrl = shuffle(servers)

      this.cometd.configure({
        url: `${this.serverUrl}/strd`,
        backoffIncrement: 1000,
        maxBackoff: 60000,
        appendMessageTypeToURL: false
      })

      this.cometd.addListener('/meta/handshake', ({ ext, successful, advice, error }) => {
        console.debug('/meta/handshake', { ext, successful, advice, error })
        if (successful) {
          const { authentication = null } = ext
          this.initialized(authentication)
        }
        else {
          this.handshakeFailure(error)
        }
      })

      this.cometd.addListener('/meta/handshake', ({ advice, error, ext, successful }) => {
        console.debug('/meta/handshake', { ext, successful, advice, error })
        // AuthNegotiation
        if (!successful) {
          if (advice === null) {
            return
          }
          if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
            this.authenticationFailed(error)
          }
          else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
            this.negotiate(ext)
          }
        }
      })

      this.cometd.addListener('/meta/connect', ({ advice, channel, successful }) => {
        console.debug('/meta/connect', { advice, channel, successful })
        // ConnectionListener
        if (this.cometd.isDisconnected()) {
          this.connected = false
          this.connectionClosed()
        } else {
          this.wasConnected = this.connected
          this.connected = successful
          if (!this.wasConnected && this.connected) {
            this.connectionEstablished()
          }
          else if (this.wasConnected && !this.connected) {
            this.connectionBroken()
          }
        }
      })
      this.cometd.handshake(this.handshake.getHandshakeFields(this))
    })
  }

  connectionEstablished() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionEstablished()
    })
  }

  connectionBroken() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionBroken()
    })
  }

  messageLost(channel, data) {
    this.connectionListeners.forEach((listener) => {
      listener.onMessageLost(channel, data)
    })
  }

  connectionClosed() {
    this.connectionListeners.forEach((listener) => {
      listener.onConnectionClosed()
    })
  }

  initialized(authentication) {
    if (authentication) {
      this.userId = authentication.userId
    }
    this.connectionListeners.forEach((listener) => {
      listener.onSuccessfulHandshake(authentication)
    })
  }

  authenticationFailed(error) {
    this.connectionListeners.forEach((listener) => {
      listener.onFailedHandshake(error)
    })
  }

  handshakeFailure() {
    this.servers.then((servers) => {
      const index = servers.indexOf(this.serverUrl)
      if (index > -1) {
        servers.splice(index, 1)
      }
      if (servers.length === 0) {
        // No more server available
      }
      else {
        this.serverUrl = shuffle(servers)
        this.cometd.configure({
          url: `${this.serverUrl}/strd`
        })
        setTimeout(() => {
          this.cometd.handshake(this.handshake.getHandshakeFields(this))
        }, 250)
      }
    })
  }

  disconnect() {
    this.cometd.disconnect()
  }

  setHandshake(handshake) {
    this.handshake = handshake
  }

  getBusinessId() {
    return this.businessId
  }

  getSessionId() {
    throw NotYetImplementedError()
  }

  getResource() {
    return this.resource
  }

  subscribe(prefix, serviceListener) {
    const subscripions = {}
    for (const method in serviceListener) {
      if (serviceListener.hasOwnProperty(method)) {
        const channel = `${prefix}/${method}`
        subscripions[method] = this.cometd.subscribe(channel, serviceListener[method])
      }
    }
    return subscripions
  }

  unsubscribe(subscripions) {
    for (const method in subscripions) {
      if (subscripions.hasOwnProperty(method)) {
        this.cometd.unsubscribe(subscripions[method])
      }
    }
  }

  addConnectionStatusListener(listener) {
    const connectionListener = Object.assign(new ConnectionStatusListener(), listener)
    this.connectionListeners.push(connectionListener)
  }
}
