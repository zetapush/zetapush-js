document.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('aside')
  const form = document.querySelector('form')
  const login = document.querySelector('input[name="login"]')
  const password = document.querySelector('input[name="password"]')

  const client = new ZetaPush.Client({
    apiUrl: '//demo-1.zpush.io/zbo/pub/business/',
    sandboxId: 'XpqH6O1y',
    handshakeStrategy() {
      return ZetaPush.AuthentFactory.createSimpleHandshake({
        login: login.value,
        password: password.value,
        deploymentId: 'simple_main'
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
    },
    onConnectionClosed() {
      console.debug('onConnectionClosed')
      client.connect()
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    client.connect()
  })
  window.client = client
})
