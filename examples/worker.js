// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'pPMDYGEz',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9081/str']);

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
    const length = 100;
    const id = uuid();
    console.time(`hello${id}`);
    const loop = Array.from({
      length,
    }).map(() => worker.hello());
    Promise.all(loop).then((strings) => {
      console.timeEnd(`hello${id}`);
      console.log(strings, strings.length);
    });
  });
  on('.js-Reduce', 'click', async (event) => {
    const id = uuid();
    console.time(`reduce--${id}`);
    const reduced = await worker.reduce([10, 20, 30, 40]);
    console.timeEnd(`reduce--${id}`);
    console.log(reduced);
  });
});
