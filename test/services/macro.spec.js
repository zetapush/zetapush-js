describe('Macro', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var apiUrl = 'http://api.zpush.io/'
  var sandboxId = 'bcu1JtRb'

  beforeEach(function () {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId
    })
  })

  it('Should correctly create a service Macro object', function () {
    var service = this.client.createService({
      Type: ZetaPush.services.Macro,
      listener: {}
    })
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof ZetaPush.services.Macro).toBeTruthy()
  })

  it('Should correctly respond when call hello macro', function (done) {
    var name = 'World'
    var client = this.client
    var service = client.createService({
      Type: ZetaPush.services.Macro,
      listener: {
        hello: function (message) {
          expect(message.data.result.message).toBe('Hello ' + name + ' !!!')
          done()
        }
      }
    })
    client.onConnectionEstablished(function () {
      service.call({
        name: 'hello',
        parameters: {
          name: name
        }
      })
    })
    client.connect()
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof ZetaPush.services.Macro).toBeTruthy()
  })
})
