module.exports = function () {
  return function (data, client, next) {
    if (data.Pos) {
      if (client && client.round && client.arena && client.arena.size) {
        var size = client.round.arena.size;
        var parts = data.Pos.replace(" ", "").split(",");
        var pos = {x: Number(parts[0]), y: size.height - parts[1]};
        data._pos = pos;
      }
    } 
    next();
  };
};