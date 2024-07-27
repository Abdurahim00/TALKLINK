const express = require("express");
const bodyParser = require('body-parser');
const {
  post_chatroom,
  delete_chatroom,
  getFriends,
  delete_all_chatrooms,
  get_chatroom,
  get_chatroom_id,
  getOrCreateChatroom,
  get_chatroom_messages
} = require("../controllers/chatroom_controller");

const app = express();

app.use(bodyParser.json());

app.post("/chatrooms", post_chatroom);
app.get("/chatrooms", get_chatroom);
app.get("/chatrooms/:id", get_chatroom_id);
app.get("/chatrooms/:id/messages", get_chatroom_messages);
app.post('/chatroom-for-user/:loggedUserId/:userId', getOrCreateChatroom);
app.get('/chatrooms/users/:userId', getFriends);
app.delete('/chatrooms/:id', delete_chatroom);
app.delete('/chatrooms/', delete_all_chatrooms);

module.exports = app;
