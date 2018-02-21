class WelcomeMacro extends ZetaPush.services.Macro {
  welcome({ message }) {
    return this.$publish('welcome', {
      message,
    });
  }
}
// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: '<%= sandboxId %>',
});

const service = client.createService({
  Type: WelcomeMacro,
  listener: {
    welcome({ data }) {
      console.log('macro welcome', data);
    },
  },
});
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
  service.welcome({
    message: 'Test',
  });
});
// Connect client to ZetaPush BaaS
client.connect();
