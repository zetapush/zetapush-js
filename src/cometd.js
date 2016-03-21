export function LongPollingTransport() {
  var _super = new org.cometd.LongPollingTransport()
  var that = org.cometd.Transport.derive(_super)

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
