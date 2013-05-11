define(function() {
    function Brain() {
        this.clientId = 'not set';
    }

    Brain.prototype.register = function (data) {
        if (data.state === 'new' && data.client !== undefined) {
            this.clientId = data.client;
        }
    };

    return Brain;
});