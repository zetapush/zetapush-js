const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})

const service = client.createService({
  type: ZetaPush.services.Echo,
  listener: getGenericServiceListener({
    type: ZetaPush.services.Echo,
    handler({ method, data }) {
      console.debug(method, data)
      document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
    }
  })
})

client.onSuccessfulHandshake(function (authentication) {
  console.debug('App::onSuccessfulHandshake', authentication)

  document.querySelector('i').textContent = `User Id: ${authentication.userId}`
})

client.connect()

const main = document.querySelector('main')

on(main, 'submit', 'form', (event) => {
  event.preventDefault()
  const target = event.target
  const method = target.getAttribute('name')
  const parameters = target.querySelector('[name="parameters"]')
  const params = JSON.parse(parameters.value)
  service[method](params)
})
