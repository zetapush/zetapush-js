// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'Y1k3xBDc'
})
// Create Messaging service
const service = client.createService({
  type: ZetaPush.services.Messaging,
  listener: {
    error(error) {
      console.log('error', error)
    },
    message(message) {
      console.log('message', message)
    }
  }
})
// Add connection establised listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})
// Add connection closed listener
client.onConnectionClosed(() => {
  console.debug('onConnectionClosed')
})
document.querySelector('.js-SendMessage').addEventListener('click', () => {
  console.log('.js-SendMessage', 'click')
  service.send({
    target: prompt('Target User Id', client.getUserId()),
    data: {
      value: 'World'
    }
  })
})
document.querySelector('.js-Connect').addEventListener('click', () => {
  console.log('.js-Connect', 'click')
  // Connect client to ZetaPush BaaS
  client.connect()
})
document.querySelector('.js-Disconnect').addEventListener('click', () => {
  console.log('.js-Disconnect', 'click')
  // Disconnect client from ZetaPush BaaS
  client.disconnect()
})
document.querySelector('.js-ShowUserId').addEventListener('click', () => {
  console.log('.js-ShowUserId', 'click')
  // Show User Id
  prompt('User Id', client.getUserId())
})
