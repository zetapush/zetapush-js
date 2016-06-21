// Create new ZetaPush Client
var client = new ZetaPush.Client({
  sandboxId: '0gDnCfo3',
  credentials: function () {
    return ZetaPush.AuthentFactory.createSimpleHandshake({
      login: document.querySelector('input[name="login"]').value,
      password: document.querySelector('input[name="password"]').value
    })
  }
})
var aside = document.querySelector('aside')
var form = document.querySelector('form')
// Add connections status handlers
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
// Bind form submit event to connect user on ZetaPush
form.addEventListener('submit', function (event) {
  event.preventDefault()
  client.connect()
})
