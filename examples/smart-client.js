const client = new ZetaPush.SmartClient({
  businessId: '5mln3Zxw',
  authenticationDeploymentId: 'VMuM'
})

client.addConnectionStatusListener({
  onConnectionEstablished() {
    console.debug('onConnectionEstablished')
  }
})

client.connect()
