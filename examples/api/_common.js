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
}
