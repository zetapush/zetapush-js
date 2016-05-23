/**
 * @type {string}
 */
const ZETAPUSH_TOKEN_KEY = 'zetapush.token'

/**
 * Provide abstraction for token persistence
 * @access protected
 */
export class AbstractTokenPersistenceStrategy {
  /**
   * @param {{key: string}} parameters
   */
  constructor({ key = ZETAPUSH_TOKEN_KEY } = {}) {
    /**
     * @access private
     * @type {string}
     */
    this.key = key
  }
  /**
   * @abstract
   * @return {string} The stored token
   */
  get() {}
  /**
   * @abstract
   * @param {{token: string}} parameters
   */
  set({ token }) {}
}

/**
 * @access protected
 * @extends {AbstractTokenPersistenceStrategy}
 */
export class LocalStorageTokenPersistenceStrategy extends AbstractTokenPersistenceStrategy {
  /**
   * @override
   * @return {string} The stored token
   */
  get() {
    return localStorage.getItem(this.key)
  }
  /**
   * @override
   * @param {{token: string}} parameters
   */
  set({ token }) {
    localStorage.setItem(this.key, token)
  }
}
