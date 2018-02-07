const { WeakClient, services } = require('zetapush-js')
const transports = require('zetapush-cometd/lib/node/Transports');


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
  
const api = client.createAsyncTaskService({
    Type: Api,
});

client.onConnectionEstablished(async() => {
    console.log('onConnectionEstablished');


    api.getData({}).then((result) => {
        console.log('result', result)
    }).catch((err) => {
        console.error('err', err)
    })
});

client.connect()