var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');
var creds = '';

var redis = require('redis');
var client = '';

// Read credentials from JSON
fs.readFile('creds.json', 'utf-8', function (err, data) {
    if (err) throw err;
    creds = JSON.parse(data);
    client = redis.createClient('redis://' + creds.user + ':' + creds.password + '@' + creds.host + ':' + creds.port);

    // Redis Client Ready
    client.once('ready', function () {

        // Flush Redis DB
        client.del('chat_users');
        client.del('chat_app_messages');
        client.set('score_left', JSON.stringify(score[0]));
        client.set('score_right', JSON.stringify(score[1]));
        //client.flushdb();

        // Initialize Messages
        client.lrange('games',0,-1, function (err, reply) {
            if (reply) {
                reply.forEach(el => {
                    games.push(el);
                });
            }
        });

       // Initialize Chatters
        client.get('chat_users', function (err, reply) {
            if (reply) {
                chatters.push(JSON.parse(reply));
            }
        });

        // Initialize Messages
        client.get('chat_app_messages', function (err, reply) {
            if (reply) {
                chat_messages.push(JSON.parse(reply));  
            }
        });

    });
});

// Store games
var games = [];

//score[0] and score[1]
var score = [0,0];

// Store people in chatroom
var chatters = [];

// Store messages in chatroom
var chat_messages = [];

var scoreL, scoreR;

var port = process.env.PORT || 8080;

// Start the Server
http.listen(port, function () {
    console.log('Server Started. Listening on *:' + port);
});

// Express Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Render Main HTML file
app.get('/', function (req, res) {
    client.lrange('games',0,-1, function (err, reply) {
        if (reply) {
            games=[];
            reply.forEach(el => {
                games.push(el);
            });
        }
    });

    res.sendFile('views/index.html', {
        root: __dirname
    });
});

// API - Join Chat
app.post('/join', function (req, res) {
    var username = req.body.username;
    if (chatters.indexOf(username) === -1) {
        chatters.push(username);
        client.set('chat_users', JSON.stringify(chatters));
        res.send({
            'chatters': chatters,
            'status': 'OK'
        });
    } else {
        res.send({
            'status': 'FAILED'
        });
    }
});

// API - Leave Chat
app.post('/leave', function (req, res) {
    var username = req.body.username;
    chatters.splice(chatters.indexOf(username), 1);
    client.set('chat_users', JSON.stringify(chatters));
    res.send({
        'status': 'OK'
    });
});

// API - Send + Store Message
app.post('/send_message', function (req, res) {
    var username = req.body.username;
    var message = req.body.message;
    chat_messages.push({
        'sender': username,
        'message': message
    });
    client.set('chat_app_messages', JSON.stringify(chat_messages));
    res.send({
        'status': 'OK'
    });
});

app.post('/reset_score', function(req, res){
    client.set('score_left', 0);
    client.set('score_right', 0);
    res.send({
        'status': 'OK'
    });
});

// API - Get Messages
app.get('/get_messages', function (req, res) {
    res.send(chat_messages);
});

// API - Get Chatters
app.get('/get_chatters', function (req, res) {
    res.send(chatters);
});

// API - Get Games
app.get('/get_games', function (req, res) {
     client.lrange('games',0,-1, function (err, reply) {
        if (reply) {
            games=[];
            reply.forEach(el => {
                games.push(el);
            });
        }
    });
    res.send(games);
});

//API - Get game score
app.get('/get_score', function (req, res) {
    // score[0]
    client.get('score_left', function (err, reply) {
        if (reply) {
            score[0]=(JSON.parse(reply));
        }
    });
    // score[1]
    client.get('score_right', function (err, reply) {
        if (reply) {
            score[1]=(JSON.parse(reply));
        }
    });
    res.send(score);
});

// Socket Connection
// UI Stuff
io.on('connection', function (socket) {

    // Fire 'send' event for updating Message list in UI
    socket.on('message', function (data) {
        io.emit('send', data);
    });

    // Fire 'count_chatters' for updating Chatter Count in UI
    socket.on('update_chatter_count', function (data) {
        io.emit('count_chatters', data);
    });

    // Fire 'update_games' for updating live and upcoming games
    // socket.on('update_games_list', function (data) {
    //     io.emit('update_games', data);
    // });

    setInterval(() => {
        io.emit('update_score');
    }, 1000);

    setInterval(() => {
        io.emit('update_games');
    }, 1000);
});
