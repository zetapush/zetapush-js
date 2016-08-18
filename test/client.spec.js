describe('Client',  function () {
  var sandboxId = 'Y1k3xBDc'

  beforeEach(function () {
    this.client = new ZetaPush.Client({
      sandboxId: sandboxId,
      credentials: function () {
        return ZetaPush.Authentication.simple({
          login: 'root',
          password: 'root'
        })
      }
    })
  })

  describe('Client initial state',  function () {
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

  describe('Client connection',  function () {
    it('Should connect', function (done) {
      var client = this.client
      client.onConnectionEstablished(function () {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      client.connect()
    })
  })

})
