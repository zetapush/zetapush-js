/**
 * @type {string}
 */
const ZETAPUSH_TOKEN_KEY = 'zetapush.token'

/**
 * @access protected
 * @desc Provide abstraction for token persistence
 */
export class AbstractTokenPersistenceStrategy {
  /**
   *
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
   */
  set({ token }) {
    localStorage.setItem(this.key, token)
  }
}
