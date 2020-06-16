const express = require('express');
const bodyParser = require('body-parser');
const appRoot = require('app-root-path');
const jwtauth = require(`${appRoot}/config/jwtauth`);
const router = express.Router();
const User = require(`${appRoot}/models/user.model`);


// Require the controllers WHICH WE DID NOT CREATE YET!!
const controller = require(`${appRoot}/controllers/user.controller`);


router.post('/create', controller.create);
router.post('/login', controller.login);
router.get('/profile/:user?', jwtauth.checkUserAccess, controller.profile);
router.get('/profile/search/:query?', controller.search); 
router.get('/profile/img/:img', controller.img);
router.get('/', (req, res, err)=>{
	res.send("hello");
	console.log(new User()._id)
	return;
})

module.exports = router;