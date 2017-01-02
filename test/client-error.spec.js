describe('Client', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var apiUrl = 'http://api.zpush.io/'
  var sandboxId = 'NotAvailableSandboxId'

  beforeEach(function () {
    this.client = new ZetaPush.Client({
      apiUrl: apiUrl,
      sandboxId: sandboxId,
      authentication: function () {
        return ZetaPush.Authentication.simple({
          login: 'root',
          password: 'root'
        })
      }
    })
  })

  describe('Connection failure', function () {
    it('Should handle connection failure', function (done) {
      var client = this.client
      client.onConnectionToServerFail(function () {
        expect(client.isConnected()).toBeFalsy()
        done()
      })
      client.connect()
    })
  })
})
