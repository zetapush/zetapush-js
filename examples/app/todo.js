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
      console.debug(`Stack::list`, { channel, data })
      const { result: { content } } = data
      document.querySelector('ul').innerHTML = content.map((item) => getTaskTemplate(item)).join('')
    },
    push({ channel, data })  {
      console.debug(`Stack::push`, { channel, data })
      const tasks = document.querySelector('ul')
      tasks.innerHTML = `${getTaskTemplate(data)}${tasks.innerHTML}`
      document.querySelector('[name="task"]').value = ''
    },
    update({ channel, data }) {
      console.debug(`Stack::update`, { channel, data })
      const { guid } = data
      document.querySelector(`[data-guid="${guid}"]`).parentNode.parentNode.innerHTML = getTaskTemplate(data, false)
    }
  }

  const getTaskTemplate = ({ guid, data }, wrapper = true) => {
    const { completed, text } = data
    return `${wrapper ? '<li>' : ''}
      <label>
        <input type="checkbox" ${completed ? 'checked' : ''} data-guid="${guid}" data-text="${text}">
        <strong>${text}</strong>
      </label>
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
    onSuccessfulHandshake(authentication) {
      console.debug('App::onSuccessfulHandshake', authentication)
      document.querySelector('i').textContent = `User Id: ${authentication.userId}`
    },
    onConnectionEstablished() {
      console.debug('App::onConnectionEstablished')
      servicePublisher.list({
        stack: 'id'
      })
    }
  })

  client.connect()

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main')
    const task = document.querySelector('[name="task"]')

    on({ node: main, type: 'submit', selector: 'form', handler: (event) => {
      event.preventDefault()

      servicePublisher.push({
        stack: 'id',
        data: {
          text: task.value,
          completed: false
        }
      })
    }})
    on({ node: main, type: 'change', selector: 'input', handler: (event) => {
      event.preventDefault()
      const { target } = event
      const { guid, text } = target.dataset
      servicePublisher.update({
        stack: 'id',
        guid,
        data: {
          text,
          completed: target.checked
        }
      })
    }})
  })
}
