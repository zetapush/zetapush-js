document.addEventListener('DOMContentLoaded', () => {
  const { AuthentFactory, Client } = ZetaPush

  const BUSINESS_ID = '5mln3Zxw'
  const AUTHENTICATION_DEPLOYMENT_ID = 'LkvA'

  const aside = document.querySelector('aside')
  const form = document.querySelector('form')
  const login = document.querySelector('input[name="login"]')
  const password = document.querySelector('input[name="password"]')

  const client = new Client({
    businessId: BUSINESS_ID,
    handshakeStrategy() {
      return AuthentFactory.createSimpleHandshake({
        login: login.value,
        password: password.value,
        deploymentId: AUTHENTICATION_DEPLOYMENT_ID
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

  window.client = client
})
