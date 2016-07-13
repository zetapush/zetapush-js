import { Transport, LongPollingTransport, WebSocketTransport } from 'zetapush-cometd'

/**
 * Implements LongPollingTransport using borwser fetch() API
 * @access private
 * @return {FetchLongPollingTransport}
 */
export function FetchLongPollingTransport() {
  const _super = new LongPollingTransport()
  const that = Transport.derive(_super)

  /**
   * Implements transport via fetch() API
   * @param {Object} packet
   */
  that.xhrSend = function (packet) {
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

/**
 * CometD Transports enumeration
 */
export const TransportTypes = {
  LONG_POLLING: 'long-polling',
  WEBSOCKET: 'websocket'
}

/**
 * CometD Transports Layers map
 */
export const TransportLayers = [{
  type: TransportTypes.WEBSOCKET,
  Transport: WebSocketTransport
}, {
  type: TransportTypes.LONG_POLLING,
  Transport: FetchLongPollingTransport
}]
