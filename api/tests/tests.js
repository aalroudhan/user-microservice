// index.js

var express = require('express'); 
var request = require('supertest');
const appRoot = require('app-root-path');
let app = require('../server');

function createApp() {
  app = express();

  return app;
}

describe('Our server', function() {
  var app;

  // Called once before any of the tests in this block begin.
  before(function(done) {
    app = createApp();
    app.listen(function(err) {
      if (err) { return done(err); }
      done();
    });
  });

  it('should send back a a 200 response', function(done) {
    request("localhost:3000")
      .get('/api/user')
      .expect(200, done);
  });

});