var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    staticHttp = require('node-static'); // for serving files

var fileServer = new staticHttp.Server('./client');
app.listen(8080);
var simpleUserHash = 0;

function handler (request, response) {

    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    socket.emit('info', {'state':'new', 'client':'client' + simpleUserHash++});

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