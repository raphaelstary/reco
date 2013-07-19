define(function () {
    function Connector() {
        this.socket = {};
    }

    Connector.prototype.connect = function (url) {
        this.socket = io.connect(url);
    };

    Connector.prototype.send = function (data) {
        console.log('send data: ' + data);

        this.socket.emit('update', data);
    };

    Connector.prototype.lock = function (data) {
        this.socket.emit('lock', data);
    };

    Connector.prototype.unlock = function (data) {
        this.socket.emit('unlock', data);
    };

    return Connector;
});