// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://vm-zbo:8080/zbo/pub/business',
  sandboxId: 'C-flCeDl',
});
client.helper.servers = Promise.resolve(['http://vm-str-1:8080/str']);

class Worker extends ZetaPush.services.Queue {
  get DEFAUT_DEPLOYMENT_ID() {
    return ZetaPush.services.Queue.DEFAUT_DEPLOYMENT_ID;
  }
  hello() {
    return this.$publish('hello');
  }
  reduce(list) {
    return this.$publish('reduce', '', list);
  }
}

const worker = client.createAsyncTaskService({
  Type: Worker,
});

client.onConnectionEstablished(async () => {
  console.debug('onConnectionEstablished');
});
client.connect();

const uuid = (() => {
  let id = 0;
  return () => ++id;
})();

const on = (cssClass, eventType, handler) =>
  document.querySelector(cssClass).addEventListener(eventType, handler);

document.addEventListener('DOMContentLoaded', () => {
  on('.js-Hello', 'click', async (event) => {
    const id = uuid();
    console.time(`hello--${id}`);
    const message = await worker.hello();
    console.timeEnd(`hello--${id}`);
    console.log(message);
  });
  on('.js-Reduce', 'click', async (event) => {
    const id = uuid();
    console.time(`reduce--${id}`);
    const reduced = await worker.reduce([10, 20, 30, 40]);
    console.timeEnd(`reduce--${id}`);
    console.log(reduced);
  });
});
