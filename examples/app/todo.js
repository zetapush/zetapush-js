// Create a Zetapush WeakClient
const client = new ZetaPush.WeakClient({
  sandboxId: 'bcu1JtRb',
});
// Get Todo item DOM
function getTodoItemDom(message, wrapper = true) {
  const { data, guid } = message;
  const { completed, text } = data;
  const checkbox = dom('input', {
    class: 'toggle',
    type: 'checkbox',
    'data-guid': guid,
    'data-text': text,
  });
  if (completed) {
    checkbox.setAttribute('checked', completed);
  }
  const content = dom(
    'div',
    { class: 'view' },
    checkbox,
    dom('label', {}, text),
    dom('button', { class: 'destroy', 'data-guid': guid }),
  );
  const form = dom(
    'form',
    { autocomplete: 'off', 'data-guid': guid, 'data-text': text },
    dom('input', { class: 'edit', value: text, autofocus: 'on', type: 'text' }),
  );
  const fragment = document.createDocumentFragment();
  fragment.appendChild(content);
  fragment.appendChild(form);
  return wrapper
    ? dom(
        'li',
        { class: completed ? 'completed' : '', 'data-guid': guid },
        fragment,
      )
    : fragment;
}
// Create a service publish to interact with remote API
const service = client.createService({
  Type: ZetaPush.services.Stack,
  listener: {
    // Triggered when api return list of stack elements
    list({ channel, data }) {
      const { content } = data.result;
      const fragment = document.createDocumentFragment();
      content.map(function(item) {
        fragment.appendChild(getTodoItemDom(item));
      });
      document.querySelector('.todo-list').appendChild(fragment);
    },
    // Triggered when api has purged
    purge() {
      const list = document.querySelector('.todo-list');
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
    },
    // Triggered when a new item is pushed
    push({ data }) {
      const list = document.querySelector('.todo-list');
      const todo = getTodoItemDom(data);
      list.insertBefore(todo, list.firstChild);
      document.querySelector('.new-todo').value = '';
    },
    // Triggered when an item is removed
    remove({ data }) {
      const { guids = [] } = data;
      guids.forEach((guid) => {
        const li = document.querySelector('input[data-guid="' + guid + '"]')
          .parentNode.parentNode;
        li.parentNode.removeChild(li);
      });
    },
    // Triggered when an item is updated
    update({ data }) {
      const { guid, data: { completed } } = data;
      const li = document.querySelector('li[data-guid="' + guid + '"]');
      li.className = completed ? 'completed' : '';
      while (li.firstChild) {
        li.removeChild(li.firstChild);
      }
      const todo = getTodoItemDom(data, false);
      li.appendChild(todo);
      const items = Array.from(document.querySelectorAll('.todo-list li'));
      items.forEach(function(item) {
        item.classList.remove('editing');
      });
    },
  },
});
// Add listener to life cycle connection events
client.onConnectionEstablished(() => {
  service.list({
    stack: 'todo-list',
  });
});
// Connect client
client.connect();

const main = document.querySelector('main');
const todo = document.querySelector('[name="todo"]');

on(main, 'submit', '.header form', (event) => {
  event.preventDefault();
  service.push({
    stack: 'todo-list',
    data: {
      text: todo.value,
      completed: false,
    },
  });
});
on(main, 'change', '.toggle', (event) => {
  const { target } = event;
  const { guid, text } = target.dataset;
  service.update({
    stack: 'todo-list',
    guid,
    data: {
      text,
      completed: target.checked,
    },
  });
});
on(main, 'click', '.destroy', (event) => {
  const target = event.target;
  const guid = target.dataset.guid;
  service.remove({
    stack: 'todo-list',
    guids: [guid],
  });
});
on(main, 'click', '.clear-all', (event) => {
  service.purge({
    stack: 'todo-list',
  });
});
on(main, 'dblclick', 'li:not(.completed) label', (event) => {
  const { target } = event;
  const li = target.parentNode.parentNode;
  li.classList.add('editing');
  li.querySelector('form input.edit').focus();
});
on(main, 'submit', '.todo-list form', (event) => {
  event.preventDefault();
  const { target } = event;
  const { guid } = target.dataset;
  const input = target.querySelector('input');
  service.update({
    stack: 'todo-list',
    guid,
    data: {
      text: input.value,
      completed: false,
    },
  });
});
on(document.documentElement, 'click', null, (event) => {
  const { target } = event;
  if (!target.classList.contains('edit')) {
    const items = Array.from(document.querySelectorAll('.todo-list li'));
    items.forEach(function(item) {
      item.classList.remove('editing');
    });
  }
});
