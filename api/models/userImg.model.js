const mongoose = require('mongoose');
const app = require('express');

const UserImgSchema = new mongoose.Schema({
  user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  img: { data: Buffer, contentType: String },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  disabled: {
    type: Boolean,
    default: false
  },
  lastModiefiedBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});


module.exports = mongoose.model('UserImg', UserImgSchema);

