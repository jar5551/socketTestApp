var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
/*app.use(logger('dev'));
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(cookieParser());
 app.use(require('node-compass')({mode: 'expanded'}));
 app.use(express.static(path.join(__dirname, 'public')));*/

app.use(express.static(__dirname + '/public'));

//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
 var err = new Error('Not Found');
 err.status = 404;
 next(err);
 });

 // error handlers

 // development error handler
 // will print stacktrace
 if (app.get('env') === 'development') {
 app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: err
 });
 });
 }

 // production error handler
 // no stacktraces leaked to user
 app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: {}
 });
 });*/
//pass: IPx1AYAoNJSqyR603N0d
var db;

MongoClient.connect('mongodb://mongo7.mydevil.net/mo1086_socketTA', function(err, database) {
    if (err) {
        throw err;
    }

    db = database;

    db.authenticate('mo1086_socketTA', 'IPx1AYAoNJSqyR603N0d', function (err, res) {
        if (err) {
            throw err;
        }
        console.log(res);
    });
});

function getUsers() {
    return users;
}

function getUsersDataToDisplay(meSocketId) {
    var ret = {};

    Object.keys(users).forEach(function(key) {
        if(meSocketId !== key) {
            ret[key] = {
                username: users[key].getUsername()
            };
        }
    });
    console.log(ret);

    return ret;
}

function getNumberOfUsers() {
    return Object.keys(users).length;
}


//User classs

var User = function (socket) {
    this.setSocket(socket);
};

User.prototype.setSocket = function (socket) {
    this.socket = socket;
};

User.prototype.getSocketId = function () {
    return this.socket.id;
};

User.prototype.setUsername = function (username) {
    this.username = username;
};

User.prototype.getUsername = function () {
    return this.username;
};


//Message classs

var Message = function () {

};

Message.prototype.addMessage = function (socketId, message) {
    db.collection('messages').insertOne( {
        socketId: socketId,
        message: message
    }, function(err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
    });
};

var users = {};

io.on('connection', function (socket) {
    var me = new User(socket);

    socket.on('disconnect', function () {
        delete users[socket.id];

        io.emit('remove user', {
            socketId: socket.id
        });
    });

    /*socket.on('add user', function (data) {
        users[socket.id] = new User(socket);
        users['/#' + data.id].setUsername(data.username);

        socket.emit('users', {
            usersData: getUsersDataToDisplay()
        });
    });*/

    socket.on('login', function (data) {
        if(!me) {
            return;
        }

        users[socket.id] = new User(socket);
        users[socket.id].setUsername(data.username);

        socket.broadcast.emit('add user', {
            username: users[socket.id].getUsername(),
            socketId: users[socket.id].getSocketId()
        });

        socket.emit('users', {
            usersData: getUsersDataToDisplay(me.getSocketId())
        });
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('message sent', function (data) {
        var messsage = new Message();
        messsage.addMessage(socket.id, data.message);

        socket.broadcast.to(data.recipient).emit('message', {message: data.message, recipient: socket.id});
    });

    //Wysyłka bezpośredniej wiadomosci do usera po identyfikatorze sesji
    socket.on('direct message', function (msg, socketid) {
        socket.broadcast.to(socketid).emit('message', msg);
    });
});

module.exports = app;

http.listen(3000, function () {
    console.log('listening on *:3000');
});
