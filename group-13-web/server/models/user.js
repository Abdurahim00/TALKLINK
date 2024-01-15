const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail} = require('validator');

const userSchema = new Schema({
  user_name: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, 'please enter a valid email' ]
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  isAdmin: {
    type: Boolean,
    default: false  // Default is not an admin
  },
    country: {
    type: String,
    required: true
  },
});

const User = mongoose.model('users', userSchema);
module.exports = User;