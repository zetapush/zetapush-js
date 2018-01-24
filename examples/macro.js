// Create new ZetaPush Client
const client = new ZetaPush.SmartClient({
  sandboxId: 'fCDDOkuc',
  apiUrl: 'https://zbo.zpush.io/zbo/pub/business',
});
const login = prompt('Login?', 'user-1');
client.setCredentials(
  login
    ? {
        login,
        password: 'password',
      }
    : {},
);
client.helper.servers = Promise.resolve([
  prompt('Server?', 'https://cluster-1-str-1.zpush.io/str'),
]);
// Create a Macro service
const api = client.createService({
  Type: ZetaPush.services.Macro,
  listener: {
    hello({ data }) {
      console.log('hello', data)
    }
  }
})
// Add connection establised listener
client.onConnectionEstablished(() => {
  console.debug('onConnectionEstablished');
});
// Add connection closed listener
client.onConnectionClosed(() => {
  console.debug('onConnectionClosed');
});
document.querySelector('.js-Welcome').addEventListener('click', () => {
  console.log('.js-Welcome', 'click');
  api.call({
    name: 'welcome',
    parameters: {},
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
