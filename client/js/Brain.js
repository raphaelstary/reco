define(function () {
    function Brain() {
        this.userId = undefined;
        this.cssClass = undefined;
    }

//    Brain.prototype.register = function (data, callbackToSetUserName) {
//        if (this.userId === undefined && data.state === 'new' && data.user !== undefined) {
//            this.userId = data.user;
//            this.cssClass = data.css;
//            callbackToSetUserName(data.user);
//        }
//    };

    return Brain;
});