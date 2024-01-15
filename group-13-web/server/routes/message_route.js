const express = require("express");
const Message = require("../modules/message");
const Chatroom = require("../modules/chatroom");
var { createServer } = require('http');
const app = express();
const bodyParser = require('body-parser');


const  {delete_all_messages,post_message, get_message, get_message_id, message_chatroom,post_message_to_chatroom, get_message_from_chatroom, delete_message,  update_msg}= require("../controllers/message_controller")


app.use(bodyParser.json());

app.post("/messages",post_message );

app.post("/chatrooms/:chatroomId/messages", post_message_to_chatroom);

app.get("/messages", get_message );

app.get("/messages/:id", get_message_id);

app.get("/chatrooms/:chatroomId/messages/:id", get_message_from_chatroom);

app.delete("/chatrooms/:chatroomId/messages/:id", delete_message);

app.get("/chatrooms/:chatroomId/messages", message_chatroom );

app.put("/messages/:id", update_msg);

app.delete("/messages", delete_all_messages);

module.exports = app;
