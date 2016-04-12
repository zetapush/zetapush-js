/**
 * Match unsecure pattern web
 * @type {RegExp}
 */
const UNSECURE_PATTERN = /^http:\/\/|^\/\//

/**
 * @access private
 * @param {Array<Object>} list
 * @return {Object}
 */
export const shuffle = (list) => {
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

/**
 * @access private
 * @param {string} url
 * @param {boolean} enableHttps
 * @return {string}
 */
export const getSecureUrl = (url, enableHttps) => {
  return enableHttps ? url.replace(UNSECURE_PATTERN, 'https://') : url
}

/**
 * @access private
 * @return {Promise}
 */
export const getServers = ({ apiUrl, businessId, enableHttps }) => {
  const secureApiUrl = getSecureUrl(apiUrl, enableHttps)
  const url = `${secureApiUrl}${businessId}`
  return fetch(url)
    .then((response) => {
      return response.json()
    })
    .then(({ servers }) => {
      // TODO: Replace by a server side implementation when available
      return servers.map((server) => {
        return getSecureUrl(server, enableHttps)
      })
    })
}

/**
 * @access private
 * @extends {Error}
 */
export class NotYetImplementedError extends Error {
  /**
   * @param {string} message
   */
  constructor(message = '') {
    super(message)
    this.name = 'NotImplementedError'
  }

}
