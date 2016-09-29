
var User = function () {
    this.connected = false;
    this.username = '';
};

var Message = function (id) {
    this.setRecipient(id);
    this.openWindow(id);
};

User.prototype.connect = function (username) {
    this.connected = true;
    this.setUsername(username);
    //socket.emit('add user', {username: username, id: socket.id});
    socket.emit('login', {username: username});
};

User.prototype.setSocketId = function (socketId) {
    this.socketId = socketId;
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

User.prototype.login = function (username) {
    try {
        commonMethods.validateName(username);

        me.connect(username);
        elements.$mainHeaderUsername.text(username);
        elements.$welcome.fadeOut();
        elements.$chat.show();

    } catch (error) {
        commonMethods.showErrorMsg(error, $(this).find('input').parent('.form-group'))
    }
};

User.prototype.isConnected = function () {
    return this.connected;
};

Message.prototype.openWindow = function (id) {
    if($('#message_' + id).length > 0) {
        this.focusOnMessage();
        return;
    }

    var user = users['/#' + id];

    //console.log(user.getName());
    //console.log(this.getRecipient());

    $('.messageBoxContainer').append('<div id="message_' + id + '" class="messageBox">' +
        '<header>' + user.getUsername() + '<span class="close"></span></header>' +
        '<ul id="messages">' +
        '<li>From: message</li><li>From: message</li><li>From: message</li><li>From: message</li>' +
        '</ul>' +
        '<form id="messageForm">' +
        '<input id="m" class="form-control" autocomplete="off"/>' +
        '</form><' +
        '/div>');

    this.focusOnMessage();
};

Message.prototype.getMessages = function () {
    return [];
};

Message.prototype.setRecipient = function (recipient) {
    this.recipient = '/#' + recipient;
};

Message.prototype.getRecipient = function () {
    return this.recipient;
};

Message.prototype.focusOnMessage = function () {
    $('#message_' + this.getRecipient().slice(2)).find('input').focus();
};

var commonMethods = {
    isEmpty: function (val) {
        return !val;
    },
    validateName: function (name) {
        if (this.isEmpty(name)) {
            throw 'Proszę podać imię'
        }

        return true;
    },
    showErrorMsg: function (errorMsg, element) {
        if (typeof element === 'undefined') {
            element = false;
        }
        var el = elements.$body.append('<div id="errorMsg">' + errorMsg + '</div>');

        if (element) {
            element.addClass('has-error');
        }
        setTimeout(function () {
            el.find('#errorMsg').remove();
        }, 5000);
    }
};

var elements = {
    $body: $('body'),
    $welcome: $('#welcome'),
    $chat: $('#chat'),
    $welcomeForm: $('#welcomeForm'),
    $inputFormControl: $('input.form-control'),
    $mainHeaderUsername: $('#mainHeader span'),
    $messages: $('#messageBoxContainer')
};

elements.$chat.hide();

//CLICKS EVENTS

elements.$inputFormControl.keypress(function () {
    $(this).parent('.form-group').removeClass('has-error');
});

elements.$welcomeForm.submit(function (event) {
    var username = $(this).find('input').val();
    me.login(username);
    event.preventDefault();
});

$(document).on('click', '#chat .users ul li a', function(event){
    var id = $(this).parent('li').attr('id');

    messages[id] = new Message(id);

    console.log(messages);

    event.preventDefault();
});

$(document).on('click', '#chat .users ul li .close', function(event){
    var id = $(this).parent('li').attr('id');
    $('#'.id).remove();

    delete messages[id];

    event.preventDefault();
});

/*$('form').submit(function () {

 if ($('#to').val() !== '') {
 socket.emit('direct message', $('#m').val(), $('#to').val());
 } else {
 socket.emit('chat message', $('#m').val());
 }

 $('#m').val('');
 return false;
 });*/

//SOCKET STUFF
var socket = io();

socket.on('some event', function (msg) {
    $('#messages').append($('<li>').text(msg));
});

socket.on('chat message', function (msg) {
    $('#messages').append($('<li>PUBLIC: ').text(msg));
});

socket.on('users', function (data) {
    console.log('users', data.usersData);

    $.each(data.usersData, function (key, val) {
        users[key] = new User();

        users[key].setUsername(val.username);
        users[key].setSocketId(key);

        $('#chat .users ul').append('<li id="' + key.slice(2) + '"><a><span>' + val.username + '</span></a></li>');
    });
});

socket.on('add user', function (data) {
    if(!me.isConnected()) {
        return;
    }

    users[data.socketId] = new User();

    users[data.socketId].setUsername(data.username);
    users[data.socketId].setSocketId(data.socketId);

    $('#chat .users ul').append('<li id="' + data.socketId.slice(2) + '"><a><span>' + data.username + '</span></a></li>');
});

socket.on('remove user', function (data) {
    if(!me.isConnected()) {
        return;
    }

    delete users[data.socketId];

    $('#' + data.socketId.slice(2)).remove();
});

var me = new User();
var users = {};
var messages = {};