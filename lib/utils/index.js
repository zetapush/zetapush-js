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
 * Alpha numeric dictionary
 */
const DICTIONARY = 'abcdefghijklmnopqrstuvwxyz0123456789'

/**
* Default ZetaPush API URL
* @access private
*/
export const API_URL = 'https://api.zpush.io/'

/**
 * @access private
 * @param {string} apiUrl
 * @return {string}
 */
const normalizeApiUrl = (apiUrl) => {
  const last = apiUrl.charAt(apiUrl.length - 1)
  const SLASH = '/'
  return last === SLASH ? apiUrl : apiUrl + SLASH
}

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
  const normalizedSecuresApiUrl = normalizeApiUrl(getSecureUrl(apiUrl, forceHttps))
  const url = `${normalizedSecuresApiUrl}${sandboxId}`
  return fetch(url)
    .then((response) => response.json())
    // TODO: Replace by a server side implementation when available
    .then(({ servers }) => servers.map((server) => getSecureUrl(server, forceHttps)))
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

/**
 * Get random id
 * @return {string}
 */
export const uuid = (entropy = 7, dictionary = DICTIONARY) => Array.from(Array(entropy)).reduce((previous) => {
  const next = dictionary.charAt(Math.floor(Math.random() * dictionary.length))
  return `${previous}${next}`
}, '')
