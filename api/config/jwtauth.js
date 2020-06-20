const appRoot = require('app-root-path');
const Creds = require(`${appRoot}/models/credentials.model`);
const User = require(`${appRoot}/models/user.model`);
const Utilities = require(`${appRoot}/utility/utilities`);
const defaults = require(`${appRoot}/config/defaults`)
const jwt = require('jwt-simple');


var token;
let authenticate = function(req, res) {
  token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
  || req.headers['authorization'] || null; 
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  req.user = {};
	if (token) {
		try {
      let decoded = jwt.decode(token, process.env[`${defaults.SERVICE}_JWT_SECRET`] || defaults.JWT_SECRET);
			if (decoded.exp >= Date.now()) {
        res.end('Access token has expired', 403);
        return false;
			}else{
        console.log(decoded._id);
        req.currentUser = decoded._id;
        return true;
			}
		} catch (err) {
      Utilities.errResponse(err, res, 403, 101, 'This operation requires Authentication');
    }
	} else {
    return false
  }
};

module.exports.auth = function(req, res){
  authenticate(req, res);
};

module.exports.checkUserAccess = function(req, res, next){
  if (!authenticate(req, res, next))
  Utilities.errResponse(null, res, 403, 101, 'This operation requires Authentication');

  
  var userId = req.currentUser;
	if(req.params.user){
		userId = req.params.user;
	}
	User.findOne({ _id: userId }).exec(function(err, user) {
    if(user){
      //if(user.private && user.audience.includes(req.currentUser)){
        req.user = user;
        next();
      //}
    }else{
      Utilities.errResponse(err, res, 403, 101,'you do not have access to view this profile');
    }
  });
};

module.exports.checkVendor = function(req, res, next){
    if (!this.authenticate(req, res, next))
      Utilities.errResponse(null, res, 403, 101, 'This operation requires Authentication');
 
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
};

module.exports.checkVendorAccess = function(req, res, next){
  if (!this.authenticate(req, res, next))
      Utilities.errResponse(null, res, 403, 101, 'This operation requires Authentication');
 
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
    Utilities.errResponse(err, res, 403, 102,'you do not have access to update this vendor commodities');
  }
};

module.exports.checkAdminAccess = function(req, res, next){
	if (!this.authenticate(req, res, next))
      Utilities.errResponse(null, res, 403, 101, 'This operation requires Authentication');
 
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