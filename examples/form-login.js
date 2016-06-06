var aside = document.querySelector('aside')
var form = document.querySelector('form')
var login = document.querySelector('input[name="login"]')
var password = document.querySelector('input[name="password"]')

var client = new ZetaPush.Client({
  sandboxId: '0gDnCfo3',
  handshakeStrategy: function () {
    return ZetaPush.AuthentFactory.createSimpleHandshake({
      login: login.value,
      password: password.value
    })
  }
})

client.addConnectionStatusListener({
  onConnectionEstablished: function () {
    console.debug('onConnectionEstablished')
    aside.className = 'success'
    aside.textContent = 'ConnectionEstablished'
  },
  onFailedHandshake: function (error) {
    console.debug('onFailedHandshake', error)
    aside.className = 'error'
    aside.textContent = error
  },
  onConnectionClosed: function () {
    console.debug('onConnectionClosed')
    client.connect()
  }
})

form.addEventListener('submit', function (event) {
  event.preventDefault()
  client.connect()
})
