const defineSupportCode = require('cucumber').defineSupportCode
const assert = require('assert')
const transports = require('zetapush-cometd/lib/node/Transports');
const { WeakClient, services } = require('zetapush-js')

// Create new ZetaPush Client
const client = new WeakClient({
    apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
    sandboxId: 'D-lY6aNX',
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

defineSupportCode(function({ BeforeAll, Given, Then, When}) {
    var result = null;
    BeforeAll(function() {

        client.onConnectionEstablish(()  => {
            console.log('Connected')
        })

        client.connect()


    })

    Given('I store {int} in database', function (input) {
        // api.saveData({data: input}).then((res) => {
        //     callback()
        // }).catch((err) => {
        //     console.error('ErrorSaveData', err)
        // })

        
    });
    // When('I retrieve {int} from the database', function(input) {
    //     api.getData({}).then((output) => {
    //         console.log('output', output)
    //         result = output.result.data
    //     });
    // });
    // Then('I have {int} as result', function(input) {
    //     assert.equal(result, input)
    // });
})


