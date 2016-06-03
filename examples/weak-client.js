const client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})

client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})

client.connect()
