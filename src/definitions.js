/**
 * @desc Echo Service API
 * @access public
 */
export const EchoPublisherDefinition = {
  /**
   * @desc Echoes an object: the server will echo that object on channel 'echo' for the current user.
   */
  echo() { }
}

/**
 * @desc Stack Service API
 * @access public
 */
export const StackPublisherDefinition = {
  /**
   * @desc Returns the whole list of listeners for the given stack.
   */
  getListeners() { },
  /**
   * @desc Returns a paginated list of contents for the given stack. Content is sorted according to the statically configured order.
   */
  list() { },
  /**
   * @desc Removes all items from the given stack.
   */
  purge() { },
  /**
   * @desc Pushes an item onto the given stack. The stack does not need to be created.
   */
  push() { },
  /**
   * @desc Removes the item with the given guid from the given stack.
   */
  remove() { },
  /**
   * @desc Sets the listeners for the given stack.
   */
  setListeners() { },
  /**
   * @desc Updates an existing item of the given stack. The item MUST exist prior to the call.
   */
  update() { }
}
