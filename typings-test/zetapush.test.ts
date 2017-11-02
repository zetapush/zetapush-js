const { Authentication, Client, services } = ZetaPush

const client = new Client({
  apiUrl: '',
  sandboxId: '',
  authentication: () => Authentication.simple({
    login: 'login',
    password: 'password'
  })
})

client.onSuccessfulHandshake((authentication) => {
  console.log(authentication);
})

client.connect()

class Api extends services.Macro {
  hello() {
    return Promise.resolve('world')
  }
  async world() {
    return this.$publish('world')
  }
}

const service = client.createAsyncMacroService({
  Type: Api
}) as Api

service.hello().then((message) => {
  console.log(message);
})
