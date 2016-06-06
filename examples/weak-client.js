var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})

client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')
})

client.connect()
