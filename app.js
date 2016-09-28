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

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});
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

var clients = {};

io.on('connection', function(socket){
  console.log('a user connected', socket.id);

  clients[socket.id] = socket;

  for(var i in clients) {
    console.log(i);
  }

  socket.on('disconnect', function(){
    delete clients[socket.id];
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  //Wysyłka bezpośredniej wiadomosci do usera po identyfikatorze sesji
  socket.on('direct message', function (msg, socketid) {
    io.to(socketid).emit('some event', 'whatever');
  });

});

module.exports = app;

http.listen(3000, function () {
  console.log('listening on *:3000');
});
