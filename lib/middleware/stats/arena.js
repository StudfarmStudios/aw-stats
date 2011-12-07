exports = module.exports = function () {
  return function (data, client, next) {
    client.arena = data.Arena;
    next();
  }
};