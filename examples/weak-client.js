const client = new ZetaPush.WeakClient({
  sandboxId: 'mv-BrBKU'
})

client.addConnectionStatusListener({
  onConnectionEstablished() {
    console.debug('onConnectionEstablished')
  }
})

client.connect()
