const mongoose = require('mongoose');
const achievements = require('./achievements');
const Schema = mongoose.Schema;

const chatroomSchema = new Schema({
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'messages'
  }]
});

const Chatroom = mongoose.model('chatrooms', chatroomSchema);
module.exports = Chatroom;