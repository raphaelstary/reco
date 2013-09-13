define(function () {
    function Brain() {
        this.userId = undefined;
    }

    Brain.prototype.register = function (data, callbackToSetUserName) {
        if (this.userId === undefined && data.state === 'new' && data.user !== undefined) {
            this.userId = data.user;
            callbackToSetUserName(data.user);
        }
    };

    return Brain;
});