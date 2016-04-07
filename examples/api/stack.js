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

  const DEPLOYMENT_ID = 'kiRa'

  const serviceListener = SmartClient.getServiceListener({
    methods: ['error', ...Object.getOwnPropertyNames(StackPublisherDefinition)],
    handler: ({ channel, data, method }) => {
      console.debug(`Stack::${method}`, { channel, data })
      document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
    }
  })

  client.subscribeListener({
    deploymentId: DEPLOYMENT_ID,
    serviceListener: serviceListener
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('App::onSuccessfulHandshake', authentication)

      document.querySelector('i').textContent = `User Id: ${authentication.userId}`
    }
  })

  const servicePublisher = client.createServicePublisher({
    deploymentId: DEPLOYMENT_ID,
    publisherDefinition: StackPublisherDefinition
  })

  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main')

    on({ node: main, type: 'click', selector: 'form button', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const method = target.getAttribute('method')
      const parameters = document.querySelector(`form[name="${method}"] [name="parameters"]`)
      if (servicePublisher.hasOwnProperty(method)) {
        const params = JSON.parse(parameters.value)
        servicePublisher[method](params)
      }
    }})
  })
}
