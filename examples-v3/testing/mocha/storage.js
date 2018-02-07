const { WeakClient, services } = require('zetapush-js')
const transports = require('zetapush-cometd/lib/node/Transports');
var assert = require('chai').assert

// Create new ZetaPush Client
const client = new WeakClient({
    apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
    sandboxId: 'UcDdJMDy',
    transports
  });

client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends services.Queue {
    hello() { return this.$publish('hello', ''); }
    reduce(list) { return this.$publish('reduce', '', list); }
    push(item) { return this.$publish('push', '', { item }); }
    list() { return this.$publish('list', ''); }
    createUser(profile = {}) { return this.$publish('createUser', '', profile); }
    findUsers(parameters = {}) { return this.$publish('findUsers', '', parameters); }
    saveData(data = {}) { return this.$publish('saveData', '', data); }
    getData() { return this.$publish('getData', '');}
  }
  
api = client.createAsyncTaskService({
    Type: Api,
});

describe('Storage', function() {

    before(function(done) {
        client.onConnectionEstablished(async () => {
            console.log('onConnectionEstablished');
            done()
          });
    
        client.connect()
    })

    describe('#saveData()', function() {
        var savedData = 'toto'
        it('Should save data without error', function(done) {
            this.timeout(5000)
            var data = {'value': savedData}
            api.saveData(data).then((result) => {
                assert.equal(result.data.value, savedData)
                done()
            }).catch((err) => {
                done(err)
            })
        })
    })
})