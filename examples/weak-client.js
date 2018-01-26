// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  sandboxId: 'bcu1JtRb',
});
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
client.connect();
