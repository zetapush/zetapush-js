{
  const { SmartClient, definitions: { StackPublisherDefinition } } = ZetaPush

  const BUSINESS_ID = '5mln3Zxw'
  const DEPLOYMENT_ID = 'vS7y'
  const AUTHENTICATION_DEPLOYMENT_ID = 'VMuM'

  const client = new SmartClient({
    businessId: BUSINESS_ID,
    authenticationDeploymentId: AUTHENTICATION_DEPLOYMENT_ID
  })

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
