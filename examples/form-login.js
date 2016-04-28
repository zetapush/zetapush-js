document.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('aside')
  const form = document.querySelector('form')
  const login = document.querySelector('input[name="login"]')
  const password = document.querySelector('input[name="password"]')

  const client = new ZetaPush.Client({
    businessId: '5mln3Zxw',
    handshakeStrategy() {
      return ZetaPush.AuthentFactory.createSimpleHandshake({
        login: login.value,
        password: password.value,
        deploymentId: 'LkvA'
      })
    }
  })

  client.addConnectionStatusListener({
    onConnectionEstablished() {
      console.debug('onConnectionEstablished')
      aside.className = 'success'
      aside.textContent = 'ConnectionEstablished'
    },
    onFailedHandshake(error) {
      console.debug('onFailedHandshake', error)
      aside.className = 'error'
      aside.textContent = error
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    client.connect()
  })
})
