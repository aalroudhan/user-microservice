const defaults = {
    port:3000,
    db:'localhost:27017' ,
    errResponse: function(err, res, statusCode, errCode ,localMSG){        
        
        if (statusCode)
        res.status(statusCode);

        res.json({
            "code: ": errCode,
            "localizedMessage": localMSG
        });
        if(err){
          throw err;
        }
        return false;
      }
}
module.exports = defaults;