// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: '<%= sandboxId %>',
});
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
client.connect();
