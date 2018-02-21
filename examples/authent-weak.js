// Create new ZetaPush Client
const client = new ZetaPush.Client({
  sandboxId: '<%= sandboxId %>',
  authentication() {
    return ZetaPush.Authentication.weak({
      token: null,
    });
  },
});
// Add fail to connect to server listener
client.onConnectionToServerFail((failure) => {
  console.debug('onConnectionToServerFail', failure);
});
// Add successful handshake listener
client.onSuccessfulHandshake((authentication) => {
  console.debug('onSuccessfulHandshake', authentication);
});
// Add connection establised listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
// Connect client to ZetaPush BaaS
client.connect();
