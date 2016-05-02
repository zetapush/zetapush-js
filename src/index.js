import * as definitions from './definitions/index'

export { AuthentFactory } from './authentication/handshake'
export { ConnectionStatusListener } from './connection/connection-status'
export { Client } from './client'
export { SmartClient } from './smart-client'
export { definitions }

/**
 * SDK Version
 * @type {string}
 */
export const VERSION = process.env.ZETAPUSH_VERSION
