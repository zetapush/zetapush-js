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
 * @return {Promise}
 */
export const getServers = (url) => {
  return fetch(url)
    .then((response) => {
      return response.json()
    })
    .then(({ servers }) => {
      return servers
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
