const express = require('express');
const axios = require('axios');
const multer  = require('multer');
const appRoot = require('app-root-path');
const services = require(`${appRoot}/config/services`);
const formData = require('form-data');

var maxSize = 10 * 1000 * 1000;
var upload = multer({limits: { fileSize: maxSize }}).single('uploadedFile');


exports.proxy = async function (service, req, res){
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      Utilities.errResponse(err, res, 401, 201, err.message);
    }else{
      axiosRequest(service, req, res);
    }
  });
};

const axiosRequest = async function(service, req, res){

  let form = new formData();
  let body = req.body;
  
  for (let key in body) {
    form.append(key, body[key]);
  }

  form.append(req.file.fieldname, req.file.buffer, { filename : req.file.originalname });
  if( req.files> 0 && req.files.length > 0){
    for (let i = 0; i < req.files; i++){
      form.append(req.files[i].fieldname, req.files[i].buffer, { filename : req.files[i].originalname });
    }
  }
  
  let options = {
    method: req.method,
    url: `${services[service]}${req.orginalURL}`,
    headers: form.getHeaders(),
    data: form
  }
  try {
    const response = await axios(options);
    res.status(response.status);
    res.send(response.data);
  } catch (error) {
    res.status(400)
    res.send(error)
  }
  return;
}