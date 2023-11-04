const express = require("express");
const Chatroom = require("../modules/chatroom");
var { createServer } = require('http');
const app = express();
const bodyParser = require('body-parser');
const Message = require("../modules/message");
const Achievements = require("../modules/achievements")
const {post_chatroom, delete_chatroom, getFriends,delete_all_chatrooms, get_chatroom, get_chatroom_id, getOrCreateChatroom} = require("../controllers/chatroom_controller")


app.use(bodyParser.json());



app.use(bodyParser.json());


app.post("/chatrooms", post_chatroom );


app.get("/chatrooms", get_chatroom );


app.get("/chatrooms/:id", get_chatroom_id );

app.post('/chatroom-for-user/:loggedUserId/:userId', getOrCreateChatroom);

app.get('/chatrooms/users/:userId', getFriends)

app.delete('/chatrooms/:id', delete_chatroom)
app.delete('/chatrooms/', delete_all_chatrooms)


module.exports = app;