const services = require('./services');

module.exports = class Api {
  static get injected() {
    return [services.Stack, services.UserDirectory, services.SimpleAuthentication, services.GdaStorage];
  }
  constructor(stack, directory, auth, storage) {
    console.log('Api:constructor', stack, directory, auth)
    this.stack = stack;
    this.directory = directory;
    this.auth = auth;
    this.storage = storage
  }
  async createUser(profile = {}) {
    const output = await this.auth.createUser(profile);
    console.log('createUser', output);
    return output;
  }
  async findUsers(parameters = {}) {
    const output = await this.directory.search(parameters);
    console.log('findUsers', output);
    return output;
  }
  async list() {
    const output = await this.stack.list({ stack: 'demo' });
    console.log('list', output);
    return output;
  }
  async hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }

  async saveData(data) {
    const output = await this.storage.put({ table: 'test', column: 'column', key: 'key', data})
    console.log('saveData', output)
    return output;
  }

  async getData() {
    const output = await this.storage.get({table: 'test', key: 'key'})
    console.log('getData', output)
    return output
  }

}