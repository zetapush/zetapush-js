import { Client } from './basic';
import { Authentication } from '../authentication/handshake';
import { uuid } from '../utils';
import { Queue } from '../mapping/services';

export class ServerClient extends Client {
  constructor({ apiUrl, sandboxId, forceHttps, transports, login, password }) {
    const authentication = () =>
      Authentication.developer({
        login,
        password,
      });
    const resource = uuid();
    /**
     * Call Client constructor with specific parameters
     */
    super({
      apiUrl,
      sandboxId,
      forceHttps,
      authentication,
      resource,
      transports,
    });
  }
  disconnect() {
    return new Promise((resolve, reject) => {
      const handlers = [];
      if (this.isConnected()) {
        const onConnectionClosed = () => {
          // Remove connection status listener
          handlers.forEach((handler) => {
            this.removeConnectionStatusListener(handler);
          });
          // Resolve disconnection
          resolve();
        };
        handlers.push(this.onConnectionClosed(onConnectionClosed));
        // Disconnect client
        super.disconnect();
      } else {
        // Resolve disconnection
        resolve();
      }
    });
  }
  connect() {
    return new Promise((resolve, reject) => {
      const handlers = [];
      this.disconnect().then(() => {
        const onFailedHandshake = (error) => {
          // Remove connection status listener
          handlers.forEach((handler) => {
            this.removeConnectionStatusListener(handler);
          });
          // Reconnect client via weak auth
          super.connect();
          // Reject connection
          reject(error);
        };
        const onConnectionEstablished = () => {
          // Remove connection status listener
          handlers.forEach((handler) => {
            this.removeConnectionStatusListener(handler);
          });
          // Resolve connection success
          resolve();
        };
        // Handle connection success and fail
        handlers.push(this.onConnectionEstablished(onConnectionEstablished));
        handlers.push(this.onFailedHandshake(onFailedHandshake));
        // Connect client to ZetaPush backend
        super.connect();
      });
    });
  }
  subscribeTaskServer(Worker, deploymentId = Queue.DEFAULT_DEPLOYMENT_ID) {
    console.log('subscribeTaskServer', Worker, deploymentId);
    const queue = this.createService({
      deploymentId,
      listener: {
        async dispatch({ data: { request, taskId } }) {
          console.log('dispatch', { request, taskId });
          const { data, requestId } = request;
          const { name, namespace, parameters } = data;
          console.log('Queue::dispatch', {
            name,
            namespace,
            parameters,
            requestId,
            taskId,
          });
          try {
            const result = await Worker[name](parameters);
            console.log('result', result);
            queue.done({
              result,
              taskId,
              requestId,
              success: true,
            });
          } catch (error) {
            console.log('error', error);
            queue.done({
              result: error,
              taskId,
              requestId,
              success: false,
            });
          }
        },
      },
      Type: Queue,
    });
    queue.register({
      capacity: 100,
    });
  }
}
