{
  const { SmartClient } = ZetaPush

  const client = new SmartClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    authenticationDeploymentId: 'weak_main'
  })

  const StackPublisherDefinition = {
    getListeners() { },
    list() { },
    purge() { },
    push() { },
    remove() { },
    setListeners() { },
    update() { }
  }

  const STACK_DEPLOYMENT_ID = 'kiRa'

  const stackServiceListener = SmartClient.getServiceListener({
    methods: ['error', ...Object.getOwnPropertyNames(StackPublisherDefinition)],
    handler: ({ channel, data, method }) => {
      console.debug(`Stack::${method}`, { channel, data })
      document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
    }
  })

  client.subscribeListener({
    deploymentId: STACK_DEPLOYMENT_ID,
    serviceListener: stackServiceListener
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('Stack::onSuccessfulHandshake', authentication)

      document.querySelector('i').textContent = `User Id: ${authentication.userId}`
    }
  })

  const stackServicePublisher = client.createServicePublisher({
    deploymentId: STACK_DEPLOYMENT_ID,
    publisherDefinition: StackPublisherDefinition
  })

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

  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main')
    const form = document.querySelector('form')

    on({ node: form, type: 'submit', handler: (event) => {
      event.preventDefault()
    }})
    on({ node: main, type: 'click', selector: 'form button', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const method = target.getAttribute('method')
      const parameters = document.querySelector(`form[name="${method}"] [name="parameters"]`)
      if (stackServicePublisher.hasOwnProperty(method)) {
        const params = JSON.parse(parameters.value)
        stackServicePublisher[method](params)
      }
    }})
  })
}
