const Creds = require('../models/credentials.model');
const jwt = require('jwt-simple');


var token;
authenticate = function(req, res, next) {
  
  token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
  || req.headers['authorization'] || null; 
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  
  req.user = {};
	if (token) {
		try {
			var decoded = jwt.decode(token, 'YOUR_SECRET_STRING');
			var userFound = false
			if (decoded.exp >= Date.now()) {
        res.end('Access token has expired', 400);
        return false;
			}else{
        req.currentUser = decoded._id;
        return true;
			}
		} catch (err) {
			res.status(401);
        res.json({
          "code: ": 101,
          "localizedMessage": "This operation requires you to be logged in"
      });
      throw err;
		}
	} else {
	  res.status(401);
      res.json({
        "code: ": 101,
        "localizedMessage": "This operation requires you to be logged in"
    });
    return false;
	}

};

module.exports.checkUserAccess = function(req, res, next){
	authenticate(req, res, next);
	var userId = req.currentUser;
	if(req.params.user){
		userId = req.params.user;
	}
	vendor.findOne({ user: userId }).populate('user').exec(function(err, creds) {
      if(creds){
        if(creds.roles.includes("SUPER_ADMIN") || creds.roles.includes("USER_ADMIN") || creds._id == req.currentUser){
        req.user = creds.user;
        next();
      }else{
        res.status(401);
        res.json({
          "code: ": 101,
          "localizedMessage": "you do not have access to view this profile"
        });
        return;
      }
    }
  });

};

module.exports.checkVendor = function(req, res, next){
  if(authenticate(req, res, next)){
    var userId = req.currentUser;
    if(req.params.v_id){
      
      let id = req.params.v_id;
      Vendor.findById(id, function(err, vendor) {
        var found = vendor.users.some(function (el) {
          return el.user == userId;
        });
        if(found){
          req.vendor = vendor;
          next();
        }
      });
    }else{
      req.newVendor = true;
      next();
    }
  }
};

module.exports.checkVendorAccess = function(req, res, next){
  authenticate(req, res, next);
  var userId = req.currentUser;
  if(req.params.alias){
    let alias = req.params.alias;
    Vendor.findOne({ alias: alias }, function(err, vendor) {
      for (var i = 0; i < vendor.users; i++) {
        if(vendor.users[i].user == userId){
          req.vendor = vendor;
          next();
        }
      }
    });
  }else if(req.params.v_id){
    let vId = req.params.v_id;
    
    Vendor.findById(vId, function(err, vendor) {
      for (var i = 0; i < vendor.users.length; i++) {
        if(vendor.users[i].user == userId){
          
          req.vendor = vendor;
          next();
        }
      }
    });
  }else{
    res.status(401);
    res.json({
      "code: ": 101,
      "localizedMessage": "you do not have access to update this vendor commodities"
    });
    return;
  }
};


module.exports.checkAdminAccess = function(req, res, next){
	authenticate(req, res, next);
	var userId = req.currentUser;

	Creds.find({ user: userId }).populate('user').exec( function(err, creds) {
      if(user){
        if(creds.roles.includes("SUPER_ADMIN") || creds.roles.includes("USER_ADMIN")){
        req.user = creds.user;
        next();
      }else{
        res.status(401);
        res.json({
          "code: ": 102,
          "localizedMessage": "you do not have access to view this list"
        });
        return;
      }
    }
    });

};