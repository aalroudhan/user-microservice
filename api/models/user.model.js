const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  img:{type: mongoose.Schema.Types.ObjectId, ref: 'UserImage'},
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
  },
  private: {
    type: Boolean,
    default: false
  },
  audience: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: this
  }],
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  disabled: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

UserSchema.index({'fullname': 'text', 'email': 'text'});

module.exports = mongoose.model('User', UserSchema);

