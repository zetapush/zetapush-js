describe('Client',  function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var sandboxId = 'Y1k3xBDc'

  describe('Fetch API Url',  function () {
    it('Should get servers list', function (done) {
      fetch('https://api.zpush.io/' + sandboxId)
        .then(function (response) {
          console.log('response', response)
          return {}
        })
        .then(function (servers) {
          console.log('servers', servers)
          done()
        })
        .catch(function (error) {
          console.error(error)
          done()
        })
    })
  })
})
