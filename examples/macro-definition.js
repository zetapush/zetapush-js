function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
  }
  return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })
  if (superClass) {
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
  }
}

var HelloMacro = function (_ZetaPush$services$Ma) {
  _inherits(HelloMacro, _ZetaPush$services$Ma)
  function HelloMacro() {
    _classCallCheck(this, HelloMacro)
    return _possibleConstructorReturn(this, Object.getPrototypeOf(HelloMacro).apply(this, arguments))
  }
  HelloMacro.prototype.hello = function (value) {
    this.$publish('hello', {
      value: value
    })
  }
  return HelloMacro
}(ZetaPush.services.Macro)

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
