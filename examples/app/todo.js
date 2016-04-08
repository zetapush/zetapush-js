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
      document.querySelector('ul').innerHTML = content.map((item) => getTaskTemplate(item)).join('')
    },
    purge({ channel, data })  {
      const list = document.querySelector('.todo-list')
      list.innerHTML = ''
    },
    push({ channel, data })  {
      const list = document.querySelector('.todo-list')
      list.innerHTML = `${getTaskTemplate(data)}${list.innerHTML}`
      document.querySelector('[name="todo"]').value = ''
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
      const li = document.querySelector(`input[data-guid="${guid}"]`).parentNode.parentNode
      li.innerHTML = getTaskTemplate(data, false)
      li.className = data.data.completed ? 'completed' : ''
    }
  }

  const getTaskTemplate = ({ guid, data }, wrapper = true) => {
    const { completed, text } = data
    return `${wrapper ? `<li class="${completed ? 'completed' : ''}">` : ''}
      <div class="view">
        <input class="toggle" type="checkbox" data-guid="${guid}" data-text="${text}" ${completed ? 'checked' : ''}>
        <label>${text}</label>
        <button class="destroy" data-guid="${guid}"></button>
      </div>
    ${wrapper ? '</li>' : ''}`
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
