{
  const { WeakClient, definitions: { EchoPublisherDefinition } } = ZetaPush

  const SANDBOX_ID = '5mln3Zxw'
  const DEPLOYMENT_ID = 'vS7y'
  const AUTHENTICATION_DEPLOYMENT_ID = 'VMuM'

  const client = new WeakClient({
    sandboxId: SANDBOX_ID,
    authenticationDeploymentId: AUTHENTICATION_DEPLOYMENT_ID
  })

  client.subscribe({
    deploymentId: DEPLOYMENT_ID,
    listener: WeakClient.  getGenericServiceListener({
      methods: ['error', ...Object.getOwnPropertyNames(EchoPublisherDefinition)],
      handler: ({ channel, data, method }) => {
        console.debug(`Echo::${method}`, { channel, data })
        document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
      }
    })
  })

  client.addConnectionStatusListener({
    onConnectionEstablished() {
      console.debug('App::onConnectionEstablished')

      document.querySelector('i').textContent = `User Id: ${authentication.userId}`
    }
  })

  const servicePublisher = client.createServicePublisher({
    deploymentId: DEPLOYMENT_ID,
    definition: EchoPublisherDefinition
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
