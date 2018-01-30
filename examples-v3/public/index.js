// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: '_DYkoFRt',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPush.services.Queue {
  hello() {
    return this.$publish('hello', '');
  }
  reduce(list) {
    return this.$publish('reduce', '', list);
  }
  push(item) {
    return this.$publish('push', '', item);
  }
  list() {
    return this.$publish('list', '');
  }
}

const worker = client.createAsyncTaskService({
  Type: Api,
});

client.onConnectionEstablished(async () => {
  console.debug('onConnectionEstablished');
  [...document.querySelectorAll('button')].forEach((node) =>
    node.removeAttribute('disabled'),
  );
});
client.connect();

const uuid = (() => {
  let id = 0;
  return () => ++id;
})();

const on = (cssClass, eventType, handler) =>
  document.querySelector(cssClass).addEventListener(eventType, handler);

const trace = async (section, behavior) => {
  const begin = Date.now();
  const output = await behavior();
  const end = Date.now();
  const duration = end - begin;
  console.log({ section, begin, end, duration, output });
  return output;
};

document.addEventListener('DOMContentLoaded', () => {
  on('.js-Hello', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`hello--${id}`, () => worker.hello());
  });
  on('.js-Reduce', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`reduce--${id}`, () => worker.reduce([10, 20, 30, 40]));
  });
  on('.js-Push', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    const item = prompt('Item?');
    trace(`push--${id}`, () => worker.push(item));
  });
  on('.js-List', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    const list = await trace(`list--${id}`, () => worker.list());
    const ul = document.querySelector('ul');
    const fragment = document.createDocumentFragment();
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      fragment.appendChild(li);
    });
    ul.appendChild(fragment);
  });
});
