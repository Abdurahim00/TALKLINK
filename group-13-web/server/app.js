const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { checkUser } = require('./controllers/user_controller');
const history = require('connect-history-api-fallback');
const { Server } = require('socket.io');

require('dotenv').config();

const user = require('./modules/user.js');
const message = require('./modules/message.js');
const chatroom = require('./modules/chatroom.js');
const achievements = require('./modules/achievements.js');
const user_route = require('./routes/user_route.js');
const message_route = require('./routes/message_route.js');
const chatroom_route = require('./routes/chatroom_route.js');
const achievements_route = require('./routes/achievements_route.js');

const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

console.log('Environment Variables:');
console.log('MONGODB_URI:', mongoURI);
console.log('PORT:', port);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

mongoose.set('strictQuery', true);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
  });

const app = express();

const allowedOrigins = ['https://talklink.online', 'wss://talklink.online', 'wss://talklink.online/socket.io'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

let server;
if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/talklink.online/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/talklink.online/fullchain.pem')
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    transports: ['websocket'],
    credentials: true,
    pingInterval: 1000 * 60 * 5,
    pingTimeout: 1000 * 60 * 3
  },
  path: '/socket.io'
});

io.on("connection", (socket) => {
  console.log("connected on socket: " + socket.id);
  socket.on("chat message", (msg, room) => {
    io.emit('chat message', msg, room);
  });
});

app.use(cookieParser());
app.use(checkUser);

app.use('/api', user_route);
app.use('/api', message_route);
app.use('/api', chatroom_route);
app.use('/api', achievements_route);

app.get('/api', function(req, res) {
  res.json({ 'message': 'Welcome to your DIT342 backend ExpressJS project!' });
});

app.get('/sockettest', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

app.use('/api/*', function(req, res) {
  res.status(404).json({ 'message': 'Not Found' });
});

app.get('/set-cookie', (req, res) => {
  res.cookie('myCookie', 'cookieValue', {
    httpOnly: false,
    secure: false,
  });
  res.send('Cookie set!');
});

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

server.listen(port, function(err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}, in ${env} mode`);
  console.log(`Backend: http://127.0.0.1:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = server;
