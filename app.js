var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

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

function getUsers() {
    return users;
}

function getUsersDataToDisplay() {
    var ret = {};

    Object.keys(users).forEach(function(key) {
        ret[key] = {
            username: users[key].getUsername()
        };
    });
    console.log(ret);

    return ret;
}

function getNumberOfUsers() {
    return Object.keys(users).length;
}

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

var users = {};

io.on('connection', function (socket) {
    function emmitUsers() {
        socket.broadcast.emit('users', {
            usersData: getUsersDataToDisplay()
        });
    }

    function newUserAdded(socketId) {
        socket.broadcast.emit('new user', {
            username: users[socketId].getUsername(),
            socketId: users[socketId].getSocketId()
        });
    }

    socket.on('disconnect', function () {
        delete users[socket.id];
        //emmitUsers();

        socket.broadcast.emit('remove user', {
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
        users[socket.id] = new User(socket);
        users[socket.id].setUsername(data.username);

        io.to(socket.id).emit('users', {
            usersData: getUsersDataToDisplay()
        });

        socket.broadcast.emit('add user', {
            username: users[socket.id].getUsername(),
            socketId: users[socket.id].getSocketId()
        });


    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    //Wysyłka bezpośredniej wiadomosci do usera po identyfikatorze sesji
    socket.on('direct message', function (msg, socketid) {
        io.to(socketid).emit('some event', 'whatever');
    });

    emmitUsers();
});

module.exports = app;

http.listen(3000, function () {
    console.log('listening on *:3000');
});
