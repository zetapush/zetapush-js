
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
  node.addEventListener(type, (event) => {
    const { target } = event
    const current = (selector === null) ? node : getCurrentTarget(node, target, selector)
    if (current) {
      handler.call(current, event)
    }
  }, false)
}

function dom(tag, attributes = {}, ...children) {
  const element = document.createElement(tag)
  for (let attribute in attributes) {
    if (attributes.hasOwnProperty(attribute)) {
      element.setAttribute(attribute, attributes[attribute])
    }
  }
  const fragment = document.createDocumentFragment()
  children.forEach((child) => {
    if (typeof child === 'string') {
      child = document.createTextNode(child)
    }
    fragment.appendChild(child)
  })
  element.appendChild(fragment)
  return element
}

function getGenericServiceListener({ handler, type }) {
  const methods = ['error'].concat(Object.getOwnPropertyNames(type.prototype).filter((property) => {
    return property != 'constructor'
  }))
  return methods.reduce((listener, method) => {
    listener[method] = (message) => {
      message.method = method
      handler(message)
    }
    return listener
  }, {})
}
