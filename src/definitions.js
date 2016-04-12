/**
 * Echo Service API
 * @access public
 */
export const EchoPublisherDefinition = {
  /**
   * Echoes an object: the server will echo that object on channel 'echo' for the current user.
   */
  echo() { }
}

/**
 * Stack Service API
 * @access public
 */
export const StackPublisherDefinition = {
  /**
   * Returns the whole list of listeners for the given stack.
   */
  getListeners() { },
  /**
   * Returns a paginated list of contents for the given stack.
   * Content is sorted according to the statically configured order.
   */
  list() { },
  /**
   * Removes all items from the given stack.
   */
  purge() { },
  /**
   * Pushes an item onto the given stack. The stack does not need to be created.
   */
  push() { },
  /**
   * Removes the item with the given guid from the given stack.
   */
  remove() { },
  /**
   * Sets the listeners for the given stack.
   */
  setListeners() { },
  /**
   * Updates an existing item of the given stack. The item MUST exist prior to the call.
   */
  update() { }
}
