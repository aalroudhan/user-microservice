const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const appRoot = require('app-root-path');
const defaults = require(`${appRoot}/config/defaults`);

const CredentialsSchema = new mongoose.Schema({
local:{
    username: {
      type: String,
      required: true,
      unique: true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    hash: String,
    salt: String
},
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
roles: [{
  type: String,
}]
},
{
  timestamps: true
});


CredentialsSchema.methods.setPassword = function(password){
  this.local.salt = crypto.randomBytes(16).toString('hex');
  this.local.hash = crypto.pbkdf2Sync(password, this.local.salt, 1000, 64, 'sha512').toString('hex');
  return this.local.hash;
};

CredentialsSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.local.salt, 1000, 64, 'sha512').toString('hex');
  return this.local.hash === hash;
};

CredentialsSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this.user,
    email: this.local.username,
    name: this.local.fullname,
    roles: this.roles,
    exp: parseInt(expiry.getTime() / 1000),
  }, process.env[`${defaults.SERVICE}_JWT_SECRET`] || defaults.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

CredentialsSchema.index({'local.username': 'text'});
module.exports = mongoose.model('Credentials', CredentialsSchema);

