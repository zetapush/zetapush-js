const { WeakClient, definitions: { StackPublisherDefinition } } = ZetaPush

const client = new WeakClient({
  sandboxId: '0gDnCfo3'
})

const { publisher } = client.createServicePublisherSubscriber({
  listener: getGenericServiceListener({
    definition: StackPublisherDefinition,
    handler: ({ channel, data, method }) => {
      console.debug(`Stack::${method}`, { channel, data })
      document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
    }
  }),
  definition: StackPublisherDefinition
})

client.onSuccessfulHandshake((authentication) => {
  console.debug('App::onSuccessfulHandshake', authentication)

  document.querySelector('i').textContent = `User Id: ${authentication.userId}`
})

client.connect()

const main = document.querySelector('main')

on({ node: main, type: 'click', selector: 'form button', handler: (event) => {
  event.preventDefault()
  const { target } = event
  const method = target.getAttribute('method')
  const parameters = document.querySelector(`form[name="${method}"] [name="parameters"]`)
  const params = JSON.parse(parameters.value)
  publisher[method](params)
}})
