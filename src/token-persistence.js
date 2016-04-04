/**
 *
 */
const ZETAPUSH_TOKEN_KEY = 'zetapush.token'

/**
 *
 */
export class AbstractTokenPersistenceStrategy {
  /**
   *
   */
  constructor({ key = ZETAPUSH_TOKEN_KEY } = {}) {
    this.key = key
  }
  /**
   *
   */
  get() {
    return null
  }
  /**
   *
   */
  set({ token }) {

  }
}

/**
 *
 */
export class LocalStorageTokenPersistenceStrategy extends AbstractTokenPersistenceStrategy {
  /**
   *
   */
  get() {
    return localStorage.getItem(this.key)
  }
  /**
   *
   */
  set({ token }) {
    localStorage.setItem(this.key, token)
  }
}
