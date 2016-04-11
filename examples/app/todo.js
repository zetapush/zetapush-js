;(function () {
  var SmartClient = ZetaPush.SmartClient
  var StackPublisherDefinition = ZetaPush.definitions.StackPublisherDefinition

  var BUSINESS_ID = 'JteMN0To'
  var DEPLOYMENT_ID = 'kiRa'

  // Create a Zetapush SmartClient
  var client = new SmartClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: BUSINESS_ID,
    authenticationDeploymentId: 'weak_main'
  })

  // Declare a service listner mapping stack methods
  var serviceListener = {
    // Triggered when api return list of stack elements
    list: function list(message) {
      var content = message.data.result.content
      var fragment = document.createDocumentFragment()
      content.map(function (item) {
        fragment.appendChild(getTodoItemDom(item))
      })
      document.querySelector('.todo-list').appendChild(fragment)
    },
    // Triggered when api has purged
    purge: function purge()  {
      var list = document.querySelector('.todo-list')
      while (list.firstChild) {
        list.removeChild(list.firstChild)
      }
    },
    // Triggered when a new item is pushed
    push(message)  {
      var list = document.querySelector('.todo-list')
      var todo = getTodoItemDom(message.data)
      list.insertBefore(todo, list.firstChild)
      document.querySelector('.new-todo').value = ''
    },
    // Triggered when an item is removed
    remove: function remove(message) {
      var guids = message.data.guids
      guids.forEach(function (guid) {
        var li = document.querySelector(`input[data-guid="${guid}"]`).parentNode.parentNode
        li.parentNode.removeChild(li)
      })
    },
    // Triggered when an item is updated
    update: function update(message) {
      var data = message.data
      var guid = data.guid
      var li = document.querySelector(`li[data-guid="${guid}"]`)
      li.className = data.data.completed ? 'completed' : ''
      while (li.firstChild) {
        li.removeChild(li.firstChild)
      }
      var todo = getTodoItemDom(data, false)
      li.appendChild(todo)
      var items = document.querySelectorAll('.todo-list li')
      Array.prototype.forEach.call(items, function (item) {
        item.classList.remove('editing')
      })
    }
  }

  // Get Todo item DOM
  function getTodoItemDom(todo, wrapper = true) {
    var data = todo.data
    var guid = todo.guid
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
  var servicePublisher = client.createServicePublisher({
    deploymentId: DEPLOYMENT_ID,
    publisherDefinition: StackPublisherDefinition
  })
  // Subscribe listener methods for a given deploymentId
  client.subscribeListener({
    deploymentId: DEPLOYMENT_ID,
    serviceListener: serviceListener
  })
  // Add listener to life cycle connection events
  client.addConnectionStatusListener({
    onConnectionEstablished() {
      servicePublisher.list({
        stack: 'todo-list'
      })
    }
  })
  // Connect client
  client.connect()

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.querySelector('main')
    var todo = document.querySelector('[name="todo"]')

    on({ node: main, type: 'submit', selector: '.header form', handler: function (event) {
      event.preventDefault()
      servicePublisher.push({
        stack: 'todo-list',
        data: {
          text: todo.value,
          completed: false
        }
      })
    }})
    on({ node: main, type: 'change', selector: '.toggle', handler: function (event) {
      var target = event.target
      servicePublisher.update({
        stack: 'todo-list',
        guid: target.dataset.guid,
        data: {
          text: target.dataset.text,
          completed: target.checked
        }
      })
    }})
    on({ node: main, type: 'click', selector: '.destroy', handler: function (event) {
      var target = event.target
      servicePublisher.remove({
        stack: 'todo-list',
        guids: [target.dataset.guid]
      })
    }})
    on({ node: main, type: 'click', selector: '.clear-all', handler: function (event) {
      servicePublisher.purge({
        stack: 'todo-list'
      })
    }})
    on({ node: main, type: 'dblclick', selector: 'li:not(.completed) label', handler: function (event) {
      var target = event.target
      var li = target.parentNode.parentNode
      li.classList.add('editing')
      li.querySelector('form input.edit').focus()
    }})
    on({ node: main, type: 'submit', selector: '.todo-list form', handler: function (event) {
      event.preventDefault()
      var target = event.target
      var input = target.querySelector('input')
      servicePublisher.update({
        stack: 'todo-list',
        guid: target.dataset.guid,
        data: {
          text: input.value,
          completed: false
        }
      })
    }})
    on({ node: document.documentElement, type: 'click', handler: function (event) {
      var target = event.target
      if (!target.classList.contains('edit')) {
        var items = document.querySelectorAll('.todo-list li')
        Array.prototype.forEach.call(items, function (item) {
          item.classList.remove('editing')
        })
      }
    }})
  })
}())
