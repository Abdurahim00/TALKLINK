const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'users', 
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Message = mongoose.model('messages', messageSchema);
module.exports = Message;