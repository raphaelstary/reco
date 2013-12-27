var staticHttp = require('node-static');

var fileServer = new (staticHttp.Server)('./client');

var simpleUserHash = 0;

var app = require('http').createServer(function (request, response) {
    request.addListener('end',function () {
        fileServer.serve(request, response);
    }).resume();
});

app.listen(8080);

var io = require('socket.io').listen(app);

var CSS = {
    0: "label-info",
    1: "label-warning",
    2: "label-default",
    3: "label-danger",
    4: "label-primary",
    5: "label-success"

};

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    socket.emit('info', {'state': 'new', 'user': 'user' + simpleUserHash++, 'css': CSS[simpleUserHash % 6]});

    socket.on('update', function (data) {
        socket.broadcast.emit('update', data);
    });

    socket.on('lock', function (data) {
        socket.broadcast.emit('lock', data);
    });

    socket.on('unlock', function (data) {
        socket.broadcast.emit('unlock', data);
    });
});