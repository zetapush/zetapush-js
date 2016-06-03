{
  // Create a Zetapush WeakClient
  const client = new ZetaPush.WeakClient({
    sandboxId: '0gDnCfo3'
  })
  // Get Todo item DOM
  const getTodoItemDom = ({ guid, data }, wrapper = true) => {
    const { completed, text } = data
    const checkbox = dom('input', { 'class': 'toggle', 'type': 'checkbox', 'data-guid': guid, 'data-text': text })
    if (completed) {
      checkbox.setAttribute('checked', completed)
    }
    const content = dom('div', { 'class': 'view' },
      checkbox,
      dom('label', {}, text),
      dom('button', { 'class': 'destroy', 'data-guid': guid })
    )
    const form = dom('form', { 'autocomplete': 'off', 'data-guid': guid, 'data-text': text },
      dom('input', { 'class': 'edit', 'value': text, 'autofocus': 'on', 'type': 'text' })
    )
    const fragment = document.createDocumentFragment()
    fragment.appendChild(content)
    fragment.appendChild(form)
    return wrapper ? dom('li', { 'class': completed ? 'completed' : '', 'data-guid': guid }, fragment) : fragment
  }
  // Declare a service listner mapping stack methods
  const stackServiceListener = {
    // Triggered when api return list of stack elements
    list({ channel, data }) {
      const { result: { content } } = data
      const fragment = document.createDocumentFragment()
      content.map((item) => {
        fragment.appendChild(getTodoItemDom(item))
      })
      document.querySelector('.todo-list').appendChild(fragment)
    },
    // Triggered when api has purged
    purge({ channel, data })  {
      const list = document.querySelector('.todo-list')
      while (list.firstChild) {
        list.removeChild(list.firstChild)
      }
    },
    // Triggered when a new item is pushed
    push({ channel, data })  {
      const list = document.querySelector('.todo-list')
      const todo = getTodoItemDom(data)
      list.insertBefore(todo, list.firstChild)
      document.querySelector('.new-todo').value = ''
    },
    // Triggered when an item is removed
    remove({ channel, data }) {
      const { guids = [] } = data
      guids.forEach((guid) => {
        const li = document.querySelector(`input[data-guid="${guid}"]`).parentNode.parentNode
        li.parentNode.removeChild(li)
      })
    },
    // Triggered when an item is updated
    update({ channel, data }) {
      const { guid } = data
      const li = document.querySelector(`li[data-guid="${guid}"]`)
      li.className = data.data.completed ? 'completed' : ''
      while (li.firstChild) {
        li.removeChild(li.firstChild)
      }
      const todo = getTodoItemDom(data, false)
      li.appendChild(todo)
      const items = Array.from(document.querySelectorAll('.todo-list li'))
      items.forEach((item) => {
        item.classList.remove('editing')
      })
    }
  }
  // Create a service publish to interact with remote API
  const { publisher } = client.createServicePublisherSubscriber({
    definition: ZetaPush.definitions.StackPublisherDefinition,
    listener: stackServiceListener
  })
  // Add listener to life cycle connection events
  client.onConnectionEstablished(() => {
    publisher.list({
      stack: 'todo-list'
    })
  })
  // Connect client
  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main')
    const todo = document.querySelector('[name="todo"]')

    on({ node: main, type: 'submit', selector: '.header form', handler: (event) => {
      event.preventDefault()
      publisher.push({
        stack: 'todo-list',
        data: {
          text: todo.value,
          completed: false
        }
      })
    }})
    on({ node: main, type: 'change', selector: '.toggle', handler: (event) => {
      const { target } = event
      const { guid, text } = target.dataset
      publisher.update({
        stack: 'todo-list',
        guid,
        data: {
          text,
          completed: target.checked
        }
      })
    }})
    on({ node: main, type: 'click', selector: '.destroy', handler: (event) => {
      const { target } = event
      const { guid } = target.dataset
      publisher.remove({
        stack: 'todo-list',
        guids: [guid]
      })
    }})
    on({ node: main, type: 'click', selector: '.clear-all', handler: (event) => {
      publisher.purge({
        stack: 'todo-list'
      })
    }})
    on({ node: main, type: 'dblclick', selector: 'li:not(.completed) label', handler: (event) => {
      const { target } = event
      const li = target.parentNode.parentNode
      li.classList.add('editing')
      li.querySelector('form input.edit').focus()
    }})
    on({ node: main, type: 'submit', selector: '.todo-list form', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const input = target.querySelector('input')
      const { guid } = target.dataset
      publisher.update({
        stack: 'todo-list',
        guid,
        data: {
          text: input.value,
          completed: false
        }
      })
    }})
    on({ node: document.documentElement, type: 'click', handler: (event) => {
      const { target } = event
      if (!target.classList.contains('edit')) {
        const items = Array.from(document.querySelectorAll('.todo-list li'))
        items.forEach((item) => {
          item.classList.remove('editing')
        })
      }
    }})
  })
}
