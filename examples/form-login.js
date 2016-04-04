document.addEventListener('DOMContentLoaded', () => {
  const { AuthentFactory, Client } = ZetaPush

  const form = document.querySelector('form')
  const login = document.querySelector('input[name="login"]')
  const password = document.querySelector('input[name="password"]')

  const client = new Client({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    handshakeFactory() {
      return AuthentFactory.createSimpleHandshake({
        login: login.value,
        password: password.value,
        deploymentId: 'simple_user'
      })
    }
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('onSuccessfulHandshake', authentication)
    },

    onFailedHandshake(error) {
      console.debug('onFailedHandshake', error)
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
