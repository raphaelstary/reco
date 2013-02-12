var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    staticHttp = require('node-static'); // for serving files

var fileServer = new staticHttp.Server('./client');
app.listen(8080);

function handler (request, response) {

    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {

        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });
});