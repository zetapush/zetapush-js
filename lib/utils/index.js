/**
 * Match unsecure pattern web
 * @type {RegExp}
 */
const HTTP_PATTERN = /^http:\/\/|^\/\//

/**
 * Https protocol
 * @type {string}
 */
const HTTPS_PROTOCOL = 'https:'

/**
* Default ZetaPush API URL
* @access private
*/
export const API_URL = 'https://api.zpush.io/'

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
 * @param {boolean} forceHttps
 * @return {string}
 */
export const getSecureUrl = (url, forceHttps) => {
  return forceHttps ? url.replace(HTTP_PATTERN, 'https://') : url
}

/**
 * @access private
 * @param {{apiUrl: string, sandboxId: string, forceHttps: boolean}} parameters
 * @return {Promise}
 */
export const getServers = ({ apiUrl, sandboxId, forceHttps }) => {
  const secureApiUrl = getSecureUrl(apiUrl, forceHttps)
  const url = `${secureApiUrl}${sandboxId}`
  return fetch(url)
    .then((response) => {
      return response.json()
    })
    .then(({ servers }) => {
      // TODO: Replace by a server side implementation when available
      return servers.map((server) => {
        return getSecureUrl(server, forceHttps)
      })
    })
}

/**
 * @access private
 * @return {boolean}
 */
export const isHttpsProtocol = () => {
  return location.protocol === HTTPS_PROTOCOL
}

/**
 * @access private
 * @param Class Derived
 * @param Class Parent
 * @return {boolean}
 */
export const isDerivedOf = (Derived, Parent) => {
  let prototype = Object.getPrototypeOf(Derived)
  let is = false
  while (!(is || prototype === null)) {
    is = prototype === Parent
    prototype = Object.getPrototypeOf(prototype)
  }
  return is
}
