describe('AsyncMacro', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  function HelloMacro() {
    ZetaPush.services.Macro.apply(this, arguments)
  }
  HelloMacro.DEFAULT_DEPLOYMENT_ID = ZetaPush.services.Macro.DEFAULT_DEPLOYMENT_ID
  HelloMacro.prototype = Object.create(ZetaPush.services.Macro.prototype)
  HelloMacro.prototype.hello = function (parameters) {
    return this.$publish('hello', parameters)
  }

  var apiUrl = 'http://api.zpush.io/'
  var sandboxId = 'bcu1JtRb'

  beforeEach(function () {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId
    })
    this.service = this.client.createAsyncMacroService({
      Type: HelloMacro
    })
  })

  it('Should correctly create a service Macro object', function () {
    var service = this.service
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof HelloMacro).toBeTruthy()
  })

  it('Should correctly respond when call hello macro', function (done) {
    // var name = 'World'
    var client = this.client
    var service = this.service

    client.onConnectionEstablished(function () {
      service.hello({
        name: name
      }).then(function (result) {
        expect(result.message).toBe('Hello ' + name + ' !!!')
        done()
      })
    })
    client.connect()
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof ZetaPush.services.Macro).toBeTruthy()
  })
})
