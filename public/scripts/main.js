var User = function () {
    this.connected = false;
    this.username = '';
};

User.prototype.connect = function (username) {
    this.connected = true;
    this.setUsername(username);
    //socket.emit('add user', {username: username, id: socket.id});
    socket.emit('login', {username: username});
};

User.prototype.getSocketId = function () {
    return this.socket.id;
};

User.prototype.setUsername = function (username) {
    this.username = username;
};

User.prototype.login = function (username) {
    try {
        commonMethods.validateName(username);

        me.connect(username);

        elements.$welcome.fadeOut();
        elements.$chat.show();

    } catch (error) {
        commonMethods.showErrorMsg(error, $(this).find('input').parent('.form-group'))
    }
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
    },
};

var elements = {
    $body: $('body'),
    $welcome: $('#welcome'),
    $chat: $('#chat'),
    $welcomeForm: $('#welcomeForm'),
    $inputFormControl: $('input.form-control')
};

elements.$chat.hide();

elements.$inputFormControl.keypress(function () {
    $(this).parent('.form-group').removeClass('has-error');
});

elements.$welcomeForm.submit(function (event) {
    var username = $(this).find('input').val();
    me.login(username);
    event.preventDefault();
});

var socket = io();
/*$('form').submit(function () {

 if ($('#to').val() !== '') {
 socket.emit('direct message', $('#m').val(), $('#to').val());
 } else {
 socket.emit('chat message', $('#m').val());
 }

 $('#m').val('');
 return false;
 });*/

socket.on('some event', function (msg) {
    $('#messages').append($('<li>').text(msg));
});

socket.on('chat message', function (msg) {
    $('#messages').append($('<li>PUBLIC: ').text(msg));
});

/*socket.on('users', function (data) {
    $.each(data.usersData, function (key, val) {
        console.log(key, val);
        if(key !== me.getSocketId()) {
            $('#chat .users ul').append('<li><a><span>' + val.username + '</span></a></li>');
        }
    });
});*/

socket.on('add user', function (data) {
    $('#chat .users ul').append('<li id="' + data.socketId.slice(2) + '"><a><span>' + data.username + '</span></a></li>');
});

socket.on('remove user', function (data) {
    $('#' + data.socketId.slice(2)).remove();
});

var me = new User();