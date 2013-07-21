define(function () {
    function Brain() {
        this.clientId = undefined;
    }

    Brain.prototype.register = function (data, callbackToSetUserName) {
        if (this.clientId === undefined && data.state === 'new' && data.client !== undefined) {
            this.clientId = data.client;
            callbackToSetUserName(data.client);
        }
    };

    return Brain;
});