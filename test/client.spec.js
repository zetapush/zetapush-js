describe('Client', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var apiUrl = 'http://api.zpush.io/'
  var sandboxId = 'bcu1JtRb'

  beforeEach(function () {
    this.client = new ZetaPush.Client({
      apiUrl: apiUrl,
      sandboxId: sandboxId,
      authentication: function () {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
  })

  describe('Initial State', function () {
    it('Should correctly create a Client object', function () {
      expect(typeof this.client).toBe('object')
      expect(this.client instanceof ZetaPush.Client).toBeTruthy()
    })

    it('Should not be connected', function () {
      expect(this.client.isConnected()).toBeFalsy()
    })

    it('Should have a nul userId', function () {
      expect(this.client.getUserId()).toBeNull()
    })

    it('Should have a correct sandboxId', function () {
      expect(this.client.getSandboxId()).toBe(sandboxId)
    })
  })

  describe('Connection', function () {
    it('Should connect', function (done) {
      var client = this.client
      client.onConnectionEstablished(function () {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      expect(client.isConnected()).toBeFalsy()
      client.connect()
    })
  })
})
