{
  const { SmartClient, definitions: { StackPublisherDefinition } } = ZetaPush

  const client = new SmartClient({
    apiUrl: 'http://vm-zbo:8080/zbo/pub/business/',
    businessId: 'JteMN0To',
    authenticationDeploymentId: 'weak_main'
  })

  const DEPLOYMENT_ID = 'kiRa'

  const serviceListener = {
    list({ channel, data }) {
      const { result: { content } } = data
      const fragment = document.createDocumentFragment()
      content.map((item) => {
        fragment.appendChild(getTodoDom(item))
      })
      document.querySelector('.todo-list').appendChild(fragment)
    },
    purge({ channel, data })  {
      const list = document.querySelector('.todo-list')
      while (list.firstChild) {
        list.removeChild(list.firstChild)
      }
    },
    push({ channel, data })  {
      const list = document.querySelector('.todo-list')
      const todo = getTodoDom(data)
      section.insertBefore(todo, list.firstChild)
    },
    remove({ channel, data }) {
      const { guids = [] } = data
      guids.forEach((guid) => {
        const li = document.querySelector(`input[data-guid="${guid}"]`).parentNode.parentNode
        li.parentNode.removeChild(li)
      })
    },
    update({ channel, data }) {
      const { guid } = data
      const li = document.querySelector(`li[data-guid="${guid}"]`)
      li.className = data.data.completed ? 'completed' : ''
      while (li.firstChild) {
        li.removeChild(li.firstChild)
      }
      const todo = getTodoDom(data, false)
      li.appendChild(todo)
    }
  }

  const getTodoDom = ({ guid, data }, wrapper = true) => {
    const { completed, text } = data
    const checkbox = dom('input', { 'class': 'toggle', 'type': 'checkbox', 'data-guid': guid, 'data-text': text})
    if (completed) {
      checkbox.setAttribute('checked', completed)
    }
    const content = dom('div', { 'class': 'view' },
      checkbox,
      dom('label', {}, text),
      dom('button', { 'class': 'destroy', 'data-guid': guid })
    )
    return wrapper ? dom('li', { 'class': completed ? 'completed' : '', 'data-guid': guid }, content) : content
  }

  const servicePublisher = client.createServicePublisher({
    deploymentId: DEPLOYMENT_ID,
    publisherDefinition: StackPublisherDefinition
  })

  client.subscribeListener({
    deploymentId: DEPLOYMENT_ID,
    serviceListener: serviceListener
  })

  client.addConnectionStatusListener({
    onConnectionEstablished() {
      servicePublisher.list({
        stack: 'todo-list'
      })
    }
  })

  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main')
    const todo = document.querySelector('[name="todo"]')

    on({ node: main, type: 'submit', selector: 'form', handler: (event) => {
      event.preventDefault()
      servicePublisher.push({
        stack: 'todo-list',
        data: {
          text: todo.value,
          completed: false
        }
      })
    }})
    on({ node: main, type: 'change', selector: '.toggle', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const { guid, text } = target.dataset
      servicePublisher.update({
        stack: 'todo-list',
        guid,
        data: {
          text,
          completed: target.checked
        }
      })
    }})
    on({ node: main, type: 'click', selector: '.destroy', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const { guid } = target.dataset
      servicePublisher.remove({
        stack: 'todo-list',
        guids: [guid]
      })
    }})
    on({ node: main, type: 'click', selector: '.clear-all', handler: (event) => {
      servicePublisher.purge({
        stack: 'todo-list'
      })
    }})
  })
}
