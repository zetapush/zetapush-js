/**
 * ES2015 Polyfill to support class derivation
 */
function inherits(derived, parent) {
  derived.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: derived,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
  Object.setPrototypeOf ? Object.setPrototypeOf(derived, parent) : derived.__proto__ = parent
}

function HelloMacro() {
  return ZetaPush.services.Macro.apply(this, arguments)
}
inherits(HelloMacro, ZetaPush.services.Macro)
HelloMacro.prototype.hello = function (value) {
  this.$publish('hello', {
    value: value
  })
}

var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})

var service = client.createService({
  type: HelloMacro,
  listener: {
    error: function (message) {
      console.error('macro error', message.data)
    },
    completed: function (message) {
      console.log('macro completed', message.data.result)
    }
  }
})

client.onConnectionEstablished(function () {
  console.debug('onConnectionEstablished')

  service.publisher.hello({
    value: 'World'
  })
})

client.connect()
