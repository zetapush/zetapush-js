// Create new ZetaPush Client
const client = new ZetaPush.Client({
  sandboxId: 'Y1k3xBDc',
  authentication() {
    return ZetaPush.Authentication.simple({
      login: document.querySelector('input[name="login"]').value,
      password: document.querySelector('input[name="password"]').value
    })
  }
})
const aside = document.querySelector('aside')
const form = document.querySelector('form')
// Add connections status handlers
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
// Bind form submit event to connect user on ZetaPush
form.addEventListener('submit', (event) => {
  event.preventDefault()
  client.connect()
})
