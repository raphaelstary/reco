define(function () {
    function Brain() {
        this.clientId = 'not set';
    }

    Brain.prototype.register = function (data, callbackToSetUserName) {
        if (data.state === 'new' && data.client !== undefined) {
            this.clientId = data.client;
            callbackToSetUserName(data.client);
        }
    };

    return Brain;
});