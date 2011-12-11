exports = module.exports = function () {
  return function (data, client, next) {
    client.serverName = data.Server;
    console.log("Server "+ client.serverName + " connected");
    next();
  }
};
