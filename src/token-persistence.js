/**
 *
 */
const ZETAPUSH_TOKEN_KEY = 'zetapush.token'

/**
 * @access public
 * @desc Provide abstraction for token persistence
 */
export class AbstractTokenPersistenceStrategy {
  /**
   *
   */
  constructor({ key = ZETAPUSH_TOKEN_KEY } = {}) {
    /**
     * @access public
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
   */
  set({ token }) {}
}

/**
 * @access public
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
   */
  set({ token }) {
    localStorage.setItem(this.key, token)
  }
}
