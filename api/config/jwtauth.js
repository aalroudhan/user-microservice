const Creds = require('../models/credentials.model');
const appRoot = require('app-root-path');
const Utilities = require(`${appRoot}/utility/utilities`);
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
			let decoded = jwt.decode(token, process.emitWarning.JWT_TOKEN || 'YOUR_SECRET_STRING');
			let userFound = false
			if (decoded.exp >= Date.now()) {
        res.end('Access token has expired', 400);
        return false;
			}else{
        req.currentUser = decoded._id;
        return true;
			}
		} catch (err) {
      Utilities.errResponse(err, res, 401, 101, 'This operation requires Authentication');
    }
	} else {
	  Utilities.errResponse(null, res, 401, 101, 'This operation requires Authentication');
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
        Utilities.errResponse(err, res, 401, 101,'you do not have access to view this profile');
      }
    }
  });

};

module.exports.checkVendor = function(req, res, next){
  if(authenticate(req, res, next)){
    let userId = req.currentUser;
    if(req.params.v_id){
      
      let id = req.params.v_id;
      Vendor.findById(id, function(err, vendor) {
        let found = vendor.users.some(function (el) {
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
    Utilities.errResponse(err, res, 401, 102,'you do not have access to update this vendor commodities');
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
        Utilities.errResponse(err, res, 401, 103,'you do not have access to view this list');
      }
    }
    });

};