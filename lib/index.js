import * as services from './services'

export { Authentication } from './authentication/handshake'
export { ConnectionStatusListener } from './connection/connection-status'
export { TransportTypes } from './connection/cometd'

export { Client } from './client/basic'
export { SmartClient } from './client/smart'
export { WeakClient } from './client/weak'

export { services }

/**
 * SDK Version
 * @type {string}
 */
export const VERSION = '3.0.0'
