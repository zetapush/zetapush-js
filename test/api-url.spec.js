describe('Client', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var sandboxId = 'bcu1JtRb'

  describe('Correct API Url', function () {
    var client = new ZetaPush.Client({
      apiUrl: 'http://zbo.zpush.io/zbo/pub/business/',
      sandboxId: sandboxId,
      authentication: function () {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', function (done) {
      client.onConnectionEstablished(function () {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      expect(client.isConnected()).toBeFalsy()
      client.connect()
    })
  })

  describe('Incorrect API Url', function () {
    var client = new ZetaPush.Client({
      apiUrl: 'http://zbo.zpush.io/zbo/pub/business',
      sandboxId: sandboxId,
      authentication: function () {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', function (done) {
      client.onConnectionEstablished(function () {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      expect(client.isConnected()).toBeFalsy()
      client.connect()
    })
  })
})
