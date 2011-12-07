exports = module.exports = function(middlewares) {
  return function(data, client, next){
    var results = 0;
    var errorReceived = false;
    middlewares.forEach(function(middleware){
      middleware(data, client, function(err){
        if(err) {
          if(!errorReceived) {
            errorReceived = true;
            next(err);
          }
          return;
        }

        results++;
        if(results == middlewares.length && !errorReceived) {
          next();
        }
      });
    });
  };
};