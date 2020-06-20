const passport = require('passport');
const User = require('../models/user.model');
const Creds = require('../models/credentials.model');
const UserImg = require('../models/userImg.model');
const db = require("mongoose");
const appRoot = require('app-root-path');
const Utilities = require(`${appRoot}/utility/utilities`);
const multer  = require('multer');

var maxSize = 10 * 1000 * 1000;
var upload = multer({limits: { fileSize: maxSize }}).single('uploadedFile');

exports.create = function (req, res) {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {

      Utilities.errResponse(err, res, 401, 201, err.message);

    }else{
      console.log(req)
      let creds = new Creds();  
      let user = new User();
      let userImg = new UserImg();

      try{
        user.fullname= req.body.fullname;
        user.email= req.body.email;
        await user.save();

        if(req.file){
          userImg.name = user.fullname;
          userImg.img.contentType = req.file.mimetype;
          userImg.img.data = req.file.buffer;
          userImg.user = user._id;
          await userImg.save();

          user.img = userImg._id;
        }
    
        creds.local.username = req.body.email;        
        creds.local.hashedPassword= creds.setPassword(req.body.password);
        creds.user = user._id;
        await creds.save();
        
        token = creds.generateJwt();
        if(req.body.email)
          res.json({
            "token" : token
          });
        return;
        

      }catch(err){
        Creds.deleteOne(creds);
        User.deleteOne(user);
        UserImg.deleteOne(userImg);
        Utilities.errResponse(err, res, 401, 205,'unable to create user.');
      }
    }
  });
  return;
};

exports.login = function(req, res) {
  passport.authenticate('local', function(err, user, info){
    let token;
    // If Passport throws/catches an error
    if (err) {
      Utilities.errResponse(err, res, 403, 205,info.message);
      return false;
    }
    
    if(user){
      Creds.find().where('_id').equals(user._id)
      Creds.findOne({ user: user._id }, function(err, creds) {
        token = creds.generateJwt();
        res.json({
          "token" : token
        });
      });
    } else {
      Utilities.errResponse(err, res, 401, 206,info.message);
    }
  })(req,res);
};

exports.profile = function(req, res) {
    res.send(req.user);
};

exports.search = function(req, res) {
    var query = {};
    
    if(req.params.query){
      query = [{ 
        $match: { 
          $or: [ 
            { name : { $regex: req.params.query, $options: "i" }}, 
            { email : {$regex: req.params.query, $options: "i" }}
          ] 
        } 
      }];
    
    User.aggregate(query, function(err,result) {
      User.populate(result, {path:'vendors', select:'_id'}, function(err, _document){
        if (err) {
          Utilities.errResponse(err, res, 401, 207,info.message);
        }
        res.json(result);
        return;
      });
      return;
    });
  }else{
    Utilities.errResponse(err, res, 401, 207,'Please submit a search query');
  }
};

exports.img = function(req, res) {
  UserImg.findById(req.params.img,function(err,file){
  if (err) {
    Utilities.errResponse(err, res, 401, 208,'Please submit a search query');
  }
  
  res.set('Cache-Control', 'public, max-age=31557600');
  res.set('content-type',file.img.contentType );

  res.send(file.img.data);
});
}



