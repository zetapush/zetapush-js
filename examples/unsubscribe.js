const client = new ZetaPush.WeakClient({
  sandboxId: '<%= sandboxId %>',
});
const service = client.createService({
  Type: ZetaPush.services.Macro,
  listener: {
    error(message) {
      console.error('macro error', message.data);
    },
    completed(message) {
      console.log('macro completed', message.data.result);
    },
  },
});
// Add connection listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
// Connect client to ZetaPush BaaS
client.connect();
document.querySelector('.js-SayHello').addEventListener('click', () => {
  console.log('.js-SayHello', 'click');
  service.call({
    name: 'hello',
    parameters: {
      name: 'World',
    },
  });
});
document.querySelector('.js-Unsubscribe').addEventListener('click', () => {
  console.log('.js-Unsubscribe', 'click');
  client.unsubscribe(service);
});
