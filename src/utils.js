/**
 *
 */
export const shuffle = (list) => {
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

/**
 *
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
 *
 */
export class NotYetImplementedError extends Error {
  /**
   *
   */
  constructor(message = '') {
    super(message)
    this.name = 'NotImplementedError'
  }

}
