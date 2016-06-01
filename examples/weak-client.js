const client = new ZetaPush.WeakClient({
  sandboxId: 'mv-BrBKU'
})

client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished')
})

client.connect()
