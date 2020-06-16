const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Creds = mongoose.model('Credentials');
module.exports = function(passport) {
  // Only during the authentication to specify what user information should be stored in the session.
  console.log(passport)
  passport.use('local',new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : true
    },
    function(req, username, password, done) {
      
      Creds.findOne({ 'local.username': username }).
      populate('user').exec( function (err, creds) {
        if (err) { return done(err); }
        // Return if user not found in database
        if (!creds) {
          return done(null, false, {
            message: 'Invalid Credentials'
          });
        }
        // Return if password is wrong
        if (!creds.validPassword(password)) {
          return done(null, false, {
            message: 'Invalid Credentials'
          });
        }
        // If credentials are correct, return the user object
        return done(null, creds.user);
      });
    }
  ));
  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  // Invoked on every request by passport.session
  passport.deserializeUser(function (userId, done) {
      let user = userList.filter(user => userId === user.userId);
      // only pass if user exist in the session
      if (user.length) {
          done(null, user[0]);
      }
  });
};