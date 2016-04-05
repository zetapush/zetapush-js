{
  const { SmartClient } = ZetaPush

  const client = new SmartClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    authenticationDeploymentId: 'weak_main'
  })

  const echoServiceListener = {
    echo({ channel, data }) {
      console.debug('Echo::echo', { channel, data })
    }
  }

  const echoPublisherDefinition = {
    echo() {}
  }

  client.subscribeListener({
    deploymentId: 'XYld',
    serviceListener: echoServiceListener
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('Echo::onSuccessfulHandshake', authentication)
    }
  })

  const echoServicePublisher = client.createServicePublisher({
    deploymentId: 'XYld',
    publisherDefinition: echoPublisherDefinition
  })

  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form')
    const message = document.querySelector('[name="message"]')

    form.addEventListener('submit', (event) => {
      event.preventDefault()
      echoServicePublisher.echo({
        message: message.value
      })
    })
  })
}
