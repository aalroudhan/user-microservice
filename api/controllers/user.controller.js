const passport = require('passport');
const User = require('../models/user.model');
const Creds = require('../models/credentials.model');
const UserImg = require('../models/userImg.model');
const db = require("mongoose");
const multer  = require('multer');

var maxSize = 10 * 1000 * 1000;
var upload = multer({limits: { fileSize: maxSize }}).single('uploadedFile');

exports.create = function (req, res) {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(401);
      res.json({
        "code: ": 201,
        "localizedMessage": "",
        "error": err.message
      });
      throw err
      // A Multer error occurred when uploading.
    }else{
      
      const session = await db.startSession();
      session.startTransaction();
      let creds = new Creds();  
      let user = new User();
      let userImg = new UserImg();

      try{

        if(req.file){
          userImg.name = user.name;
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

        user.fullname= req.body.fullname;
        user.email= req.body.email;
        
        await user.save();
        

        token = creds.generateJwt();
        res.send({
          "token" : token
        });
        return;

      }catch(err){
        Creds.deleteOne(creds, errorCheck);
        User.deleteOne(user, errorCheck);
        UserImg.deleteOne(userImg , errorCheck);

        res.status(403)
        res.send({
          "code": 205,
          "localizedMessage": "unable to create user.",
          "error":err.message
        });
        throw err;
      }
    }
  });
};

exports.login = function(req, res) {
  passport.authenticate('local', function(err, user, info){
    console.log(user)
    var token;
    // If Passport throws/catches an error
    if (err) {
      res.status(403)
      res.json({
        "code: ": 205,
        "localizedMessage": "",
        "error": err.message
      });
      throw err;
    }
    
    // If a user is found
    if(user){
      Creds.findOne({ user: user._id }, function(err, creds) {
        token = creds.generateJwt();
        res.send.json({
          "token" : token
        });
      });
    } else {
      // If user is not found
      res.status(401);
      res.json({
        "code: ": 206,
        "localizedMessage": "Login Failure"
      });
      return false;
    }
  })(req,res);
};

exports.profile = function(req, res) {
    console.log(req.ip)
    
    res.send.json(req.user);
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
          res.status(401);
          res.json({
          "code: ": 207,
          "localizedMessage": "",
          "error": err.message
        });
          throw err;
        }
        res.json(result);
        return;
      });
      return;
    });
  }else{
    res.status(401);
    res.json({
      "code: ": 207,
      "localizedMessage": "",
      "error": "Please submit a search query"
    });
  }
};

exports.img = function(req, res) {
  console.log('here')
  UserImg.findById(req.params.img,function(err,file){
  if (err) {
    res.status(401);
    res.json({
      "code: ": 208,
      "localizedMessage": "",
      "error": err.message
    });
    throw err;
  }
  
  res.set('Cache-Control', 'public, max-age=31557600');
  res.set('content-type',file.img.contentType );

  res.send(file.img.data);
});
}

let errorCheck = function (err, result){
  if(err){
    throw err;
  }
}

