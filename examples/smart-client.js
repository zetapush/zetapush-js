{
  const client = new ZetaPush.SmartClient({
    businessId: '5mln3Zxw',
    authenticationDeploymentId: 'VMuM'
  })

  client.addConnectionStatusListener({
    onSuccessfulHandshake(authentication) {
      console.debug('onSuccessfulHandshake', authentication)
    },
    onConnectionEstablished() {
      console.debug('onConnectionEstablished')
    }
  })

  client.connect()
}
