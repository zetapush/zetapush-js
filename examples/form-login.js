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
    onSuccessfulHandshake(authentication) {
      console.debug('onSuccessfulHandshake', authentication)
      aside.className = 'success'
      aside.textContent = 'SuccessfulHandshake'
    },

    onFailedHandshake(error) {
      console.debug('onFailedHandshake', error)
      aside.className = 'error'
      aside.textContent = error
    },

    onConnectionEstablished() {
      console.debug('onConnectionEstablished')
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    client.connect()
  })
})
