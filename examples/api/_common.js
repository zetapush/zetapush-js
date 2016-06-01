{
  const getCurrentTarget = ({ node, target, selector }) => {
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

  const on = ({ node, type, selector = null, handler }) => {
    node.addEventListener(type, (event) => {
      const { target } = event
      const current = (selector === null) ? node : getCurrentTarget({ node, target, selector })
      if (current) {
        handler.call(current, event)
      }
    }, false)
  }
  window.on = on

  const dom = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag)
    for (const attribute in attributes) {
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
  window.dom = dom

  const getGenericServiceListener = ({ definition, handler }) => {
    const methods = ['error', ...Object.getOwnPropertyNames(definition.prototype).filter(property=>property!='constructor')]
    return methods.reduce((listener, method) => {
      listener[method] = ({ channel, data }) => handler({ channel, data, method })
      return listener
    }, {})
  }
  window.getGenericServiceListener = getGenericServiceListener
}
