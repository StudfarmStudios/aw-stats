module.exports = function () {
  return function (data, client, next) {
    if (data.Pos) {
      var size = this.round.arena.size;
      var parts = data.Pos.replace(" ", "").split(",");
      var pos = {x: parts[0], y: size.height - parts[1]};
      data._pos = pos;
    } 
    next();
  };
};