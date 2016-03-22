import { Transport, LongPollingTransport } from 'zetapush-cometd'

export function FetchLongPollingTransport() {
  var _super = new LongPollingTransport()
  var that = Transport.derive(_super)

  that.xhrSend = function(packet) {
    fetch(packet.url, {
      method: 'post',
      body: packet.body,
      headers: Object.assign(packet.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      })
    })
    .then((response) => {
      return response.json()
    })
    .then(packet.onSuccess)
    .catch(packet.onError)
  }

  return that
}
