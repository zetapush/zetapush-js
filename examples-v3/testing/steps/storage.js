const { BeforeAll, Given, When, Then } = require('cucumber')
const assert = require('assert')
const { WeakClient, services } = require('zetapush-js')
const transports = require('zetapush-cometd/lib/node/Transports');

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




BeforeAll(function(callback) {
    
    client.onConnectionEstablished(async () => {
        console.log('onConnectionEstablished');
        callback()
      });

    client.connect()
});


Given('I store {int} in database', function (input, callback) {
    api.saveData({'value': input}).then((result) => {
        callback()
    }).catch((err) => {
        console.error('ErrorSaveData', err)
    })
})

When('I retrieve {int} from the database', function(input, callback) {
    api.getData({}).then((output) => {
        console.log('output', output)
        result = output.result.column.value
        callback()
    });
});

Then('I have {int} as result', function(input) {
    assert.equal(result, input)
});


