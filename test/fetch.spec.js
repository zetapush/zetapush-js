describe('Client', function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

  var sandboxId = 'bcu1JtRb'
  var protocols = ['http']
  var server = '://api.zpush.io/' + sandboxId

  describe('Fetch API Url', function () {
    protocols.forEach(function (protocol) {
      it('Should get servers list on ' + protocol + ' sever', function (done) {
        var url = protocol + server
        fetch(url)
          .then(function (response) {
            return response.json()
          })
          .then(function (response) {
            expect(response.servers).toBeTruthy()
            done()
          })
          .catch(function (error) {
            expect(error).toBeNull()
            done()
          })
      })
    })
  })
})
