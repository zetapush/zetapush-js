(function () {
  function getCurrentTarget(node, target, selector) {
    if (target.matches(selector)) {
      return target
    }
    while (target = target.parentNode && node !== target) {
      if (target.nodeType !== 1) {
        return false
      }
      if (target.matches(selector)) {
        return target
      }
    }
    return false
  }

  function on(node, type, selector, handler) {
    node.addEventListener(type, function (event) {
      var target = event.target
      var current = (selector === null) ? node : getCurrentTarget(node, target, selector)
      if (current) {
        handler.call(current, event)
      }
    }, false)
  }
  window.on = on

  function dom(tag, attributes) {
    var children = Array.prototype.slice.call(arguments, 2)
    var element = document.createElement(tag)
    for (var attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        element.setAttribute(attribute, attributes[attribute])
      }
    }
    var fragment = document.createDocumentFragment()
    children.forEach(function (child) {
      if (typeof child === 'string') {
        child = document.createTextNode(child)
      }
      fragment.appendChild(child)
    })
    element.appendChild(fragment)
    return element
  }
  window.dom = dom

  function getGenericServiceListener(parameters) {
    var definition = parameters.definition
    var handler = parameters.handler
    var methods = ['error'].concat(Object.getOwnPropertyNames(definition.prototype).filter(function (property) {
      return property != 'constructor'
    }))
    return methods.reduce(function (listener, method) {
      listener[method] = function (message) {
        message.method = method
        handler(message)
      }
      return listener
    }, {})
  }
  window.getGenericServiceListener = getGenericServiceListener
}())
