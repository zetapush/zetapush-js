module.exports.reduce = async (list) =>
  list.reduce((cumulator, value) => cumulator + value, 0);

module.exports.hello = async () => `Hello World from JavaScript ${Date.now()}`;