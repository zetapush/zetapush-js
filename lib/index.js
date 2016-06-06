import * as services from './services/index'

export { AuthentFactory } from './authentication/handshake'
export { ConnectionStatusListener } from './connection/connection-status'
export { Client } from './client'
export { WeakClient } from './weak-client'
export { services }

/**
 * SDK Version
 * @type {string}
 */
export const VERSION = process.env.ZETAPUSH_VERSION
