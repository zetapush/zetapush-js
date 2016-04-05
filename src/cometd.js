import { Transport, LongPollingTransport } from 'zetapush-cometd'

/**
 * @access private
 * @desc Implements LongPollingTransport using borwser fetch() API
 * @return {FetchLongPollingTransport}
 */
export function FetchLongPollingTransport() {
  var _super = new LongPollingTransport()
  var that = Transport.derive(_super)

  /**
   * @desc Implements transport via fetch() API
   * @param {Object} packet
   */
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
