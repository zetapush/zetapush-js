const items = [];

exports.push = async (item) => {
  items.push(item);
  return item;
};

exports.list = async () => items;
