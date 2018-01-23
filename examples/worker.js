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
  [...document.querySelectorAll('button')].forEach((node) => node.removeAttribute('disabled'));
});
client.connect();

const uuid = (() => {
  let id = 0;
  return () => ++id;
})();

const on = (cssClass, eventType, handler) =>
  document.querySelector(cssClass).addEventListener(eventType, handler);

const trace = async (section, behavior) => {
  const begin = Date.now()
  const output = await behavior()
  const end = Date.now()
  const duration = end - begin
  console.log({ section, begin, end, duration, output })
}

document.addEventListener('DOMContentLoaded', () => {
  on('.js-Hello', 'click', (event) => {
    event.target.dataset.count = (parseInt(event.target.dataset.count, 10) || 0) + 1
    const id = uuid();
    trace(`hello--${id}`, () => worker.hello())
  });
  on('.js-Reduce', 'click', async (event) => {
    event.target.dataset.count = (parseInt(event.target.dataset.count, 10) || 0) + 1
    const id = uuid();
    trace(`reduce--${id}`, () => worker.reduce([10, 20, 30, 40]))
  });
});
