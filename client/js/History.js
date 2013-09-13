define(function () {
    function History() {
        this.dataByUser = {};
        this.dataByField = {};
        this.dataByTime = [];
    }

    History.prototype.add = function (data) {
        if (this.dataByUser[data.user] === undefined) {
            this.dataByUser[data.user] = [];
        }
        this.dataByUser[data.user].push(data);

        if (this.dataByField[data.field] === undefined) {
            this.dataByField[data.field] = [];
        }
        this.dataByField[data.field].push(data);

        this.dataByTime.push(data);
    };

    History.prototype.getByUser = function (user) {
        return this.dataByUser[user] === undefined ? [] : this.dataByUser[user];
    };

    History.prototype.getByField = function (field) {
        return this.dataByField[field] === undefined ? [] : this.dataByField[field];
    };

    History.prototype.getByTime = function () {
        return this.dataByTime;
    };

    History.prototype.getAllUsers = function () {
        var users = [];
        for (var key in this.dataByUser) {
            users.push(key);
        }

        return users;
    };

    return History;
});