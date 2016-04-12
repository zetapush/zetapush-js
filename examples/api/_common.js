;(function () {
  function getCurrentTarget(parameters) {
    var node = parameters.node
    var target = parameters.target
    var selector = parameters.selector
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

  function on(parameters) {
    var node = parameters.node
    var type = parameters.type
    var selector = parameters.selector || null
    var handler = parameters.handler
    node.addEventListener(type, function(event) {
      var target = event.target
      var current = (selector === null) ? node : getCurrentTarget({
        node: node,
        target: target,
        selector: selector
      })
      if (current) {
        handler.call(current, event)
      }
    }, false)
  }
  window.on = on

  function dom(tag, attributes) {
    var attributes = attributes || {}
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
}())
