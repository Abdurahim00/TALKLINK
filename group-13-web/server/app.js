// Load environment variables from .env file
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const { createServer } = require('http');
const { Server } = require("socket.io");

const Schema = mongoose.Schema;

const user = require('./modules/user.js');
const message = require('./modules/message.js');
const chatroom = require('./modules/chatroom.js');
const achievements = require('./modules/achievements.js');

const user_route = require('./routes/user_route.js');
const message_route = require('./routes/message_route.js');
const chatroom_route = require('./routes/chatroom_route.js');
const achievements_route = require('./routes/achievements_route.js');
const cookieParser = require('cookie-parser');
const { checkUser } = require('./controllers/user_controller');

// Variables
const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL;

// Debugging: Log environment variables
console.log('Environment Variables:');
console.log('MONGODB_URI:', mongoURI);
console.log('PORT:', port);
console.log('FRONTEND_URL:', frontendUrl);

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
}).catch(function(err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
});

// Create Express app
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Enable cross-origin resource sharing for frontend
app.use(cors({
    origin: frontendUrl,
    credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("connected on socket: " + socket.id);
    console.log("A user has connected");
    socket.on("chat message", (msg, room) => {
        io.emit('chat message', msg, room);
    });
});

app.use(cookieParser());
app.use(checkUser);

app.use(user_route);
app.use(message_route);
app.use(chatroom_route);
app.use(achievements_route);

app.get('/api', function(req, res) {
    res.json({'message': 'Welcome to your DIT342 backend ExpressJS project!'});
});

app.get('/sockettest', (req, res) => {
    res.sendFile(__dirname + '/test.html');
});

app.use('/api/*', function (req, res) {
    res.status(404).json({ 'message': 'Not Found' });
});

app.get('/set-cookie', (req, res) => {
    res.cookie('myCookie', 'cookieValue', {
        httpOnly: false,
        secure: false,
    });
    res.send('Cookie set!');
});

// Support Vuejs HTML 5 history mode
app.use(history());
const root = path.normalize(__dirname + '/..');
const client = path.join(root, 'client', 'dist');
app.use(express.static(client));

const env = app.get('env');
app.use(function(err, req, res, next) {
    console.error(err.stack);
    const err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        err_res['error'] = err.stack;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

httpServer.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://127.0.0.1:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = httpServer;
