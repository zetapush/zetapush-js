// Create a Zetapush WeakClient
var client = new ZetaPush.WeakClient({
  sandboxId: '0gDnCfo3'
})
// Get Todo item DOM
function getTodoItemDom(message, wrapper) {
  wrapper = wrapper === undefined ? true : wrapper
  var data =  message.data
  var guid = message.guid
  var completed = data.completed
  var text = data.text
  var checkbox = dom('input', { 'class': 'toggle', 'type': 'checkbox', 'data-guid': guid, 'data-text': text })
  if (completed) {
    checkbox.setAttribute('checked', completed)
  }
  var content = dom('div', { 'class': 'view' },
    checkbox,
    dom('label', {}, text),
    dom('button', { 'class': 'destroy', 'data-guid': guid })
  )
  var form = dom('form', { 'autocomplete': 'off', 'data-guid': guid, 'data-text': text },
    dom('input', { 'class': 'edit', 'value': text, 'autofocus': 'on', 'type': 'text' })
  )
  var fragment = document.createDocumentFragment()
  fragment.appendChild(content)
  fragment.appendChild(form)
  return wrapper ? dom('li', { 'class': completed ? 'completed' : '', 'data-guid': guid }, fragment) : fragment
}
// Create a service publish to interact with remote API
var service = client.createServicePublisherSubscriber({
  definition: ZetaPush.definitions.StackPublisherDefinition,
  listener: {
    // Triggered when api return list of stack elements
    list: function (message) {
      var channel = message.channel
      var data = message.data
      var content = data.result.content
      var fragment = document.createDocumentFragment()
      content.map(function (item) {
        fragment.appendChild(getTodoItemDom(item))
      })
      document.querySelector('.todo-list').appendChild(fragment)
    },
    // Triggered when api has purged
    purge: function () {
      var list = document.querySelector('.todo-list')
      while (list.firstChild) {
        list.removeChild(list.firstChild)
      }
    },
    // Triggered when a new item is pushed
    push: function (message) {
      var data = message.data
      var list = document.querySelector('.todo-list')
      var todo = getTodoItemDom(data)
      list.insertBefore(todo, list.firstChild)
      document.querySelector('.new-todo').value = ''
    },
    // Triggered when an item is removed
    remove: function (message) {
      var data = message.data
      var guids = data.guids || []
      guids.forEach(function (guid) {
        var li = document.querySelector('input[data-guid="' + guid + '"]').parentNode.parentNode
        li.parentNode.removeChild(li)
      })
    },
    // Triggered when an item is updated
    update: function (message) {
      var data = message.data
      var guid = data.guid
      var li = document.querySelector('li[data-guid="' + guid + '"]')
      li.className = data.data.completed ? 'completed' : ''
      while (li.firstChild) {
        li.removeChild(li.firstChild)
      }
      var todo = getTodoItemDom(data, false)
      li.appendChild(todo)
      var items = Array.from(document.querySelectorAll('.todo-list li'))
      items.forEach(function (item) {
        item.classList.remove('editing')
      })
    }
  }
})
// Add listener to life cycle connection events
client.onConnectionEstablished(function () {
  service.publisher.list({
    stack: 'todo-list'
  })
})
// Connect client
client.connect()

document.addEventListener('DOMContentLoaded', function () {
  var main = document.querySelector('main')
  var todo = document.querySelector('[name="todo"]')

  on(main, 'submit', '.header form', function (event) {
    event.preventDefault()
    service.publisher.push({
      stack: 'todo-list',
      data: {
        text: todo.value,
        completed: false
      }
    })
  })
  on(main, 'change', '.toggle', function (event) {
    var target = event.target
    var guid = target.dataset.guid
    var text = target.dataset.text
    service.publisher.update({
      stack: 'todo-list',
      guid: guid,
      data: {
        text,
        completed: target.checked
      }
    })
  })
  on(main, 'click', '.destroy', function (event) {
    var target = event.target
    var guid = target.dataset.guid
    service.publisher.remove({
      stack: 'todo-list',
      guids: [guid]
    })
  })
  on(main, 'click', '.clear-all', function (event) {
    service.publisher.purge({
      stack: 'todo-list'
    })
  })
  on(main, 'dblclick', 'li:not(.completed) label', function (event) {
    var target = event.target
    var li = target.parentNode.parentNode
    li.classList.add('editing')
    li.querySelector('form input.edit').focus()
  })
  on(main, 'submit', '.todo-list form', function (event) {
    event.preventDefault()
    var target = event.target
    var input = target.querySelector('input')
    var guid = target.dataset.guid
    service.publisher.update({
      stack: 'todo-list',
      guid: guid,
      data: {
        text: input.value,
        completed: false
      }
    })
  })
  on(document.documentElement, 'click', null, function (event) {
    var target = event.target
    if (!target.classList.contains('edit')) {
      var items = Array.from(document.querySelectorAll('.todo-list li'))
      items.forEach(function (item) {
        item.classList.remove('editing')
      })
    }
  })
})
