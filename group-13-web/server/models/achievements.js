const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementSchema = new Schema({
  level: {
    type: Number, 
    required: true,
  },
  route: {
    type: String, 
    required: true,
  },
});

const Achievement = mongoose.model('achievements', achievementSchema);
module.exports = Achievement;