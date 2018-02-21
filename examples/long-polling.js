// Create new ZetaPush Client with restricted transports
const client = new ZetaPush.WeakClient({
  sandboxId: '<%= sandboxId %>',
  transports: [ZetaPush.TransportTypes.LONG_POLLING],
});
// Create a Macro service
const service = client.createService({
  Type: ZetaPush.services.Macro,
  listener: {
    error({ data }) {
      console.error('macro error', data);
    },
    completed({ data }) {
      console.log('macro completed', data.result);
    },
  },
});
// Add connection establised listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
// Add connection closed listener
client.onConnectionClosed(() => {
  console.debug('onConnectionClosed');
});
document.querySelector('.js-SayHello').addEventListener('click', () => {
  console.log('.js-SayHello', 'click');
  service.call({
    name: 'hello',
    parameters: {
      name: 'World',
    },
  });
});
document.querySelector('.js-Connect').addEventListener('click', () => {
  console.log('.js-Connect', 'click');
  // Connect client to ZetaPush BaaS
  client.connect();
});
document.querySelector('.js-Disconnect').addEventListener('click', () => {
  console.log('.js-Disconnect', 'click');
  // Disconnect client from ZetaPush BaaS
  client.disconnect();
});
