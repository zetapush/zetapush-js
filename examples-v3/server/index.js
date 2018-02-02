const { services } = require('zetapush-js/es');

exports.push = async (data) => {
  const stack = exports.Factory(services.Stack);
  const output = await stack.push({ stack: 'demo', data });
  return output;
}

exports.list = async () => {
  const stack = exports.Factory(services.Stack);
  const output = await stack.list({ stack: 'demo' });
  console.log('list', output);
  return output;
}

exports.reduce = async (list) =>
  list.reduce((cumulator, value) => cumulator + value, 0);

exports.hello = async () => `Hello World from JavaScript ${Date.now()}`;
