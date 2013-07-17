define(function() {
    function History() {
        this.dataByClient = {};
        this.dataByField = {};
        this.dataByTime = [];
    }

    History.prototype.add = function (data) {
        if (this.dataByClient[data.client] === undefined) {
            this.dataByClient[data.client] = [];
        }
        this.dataByClient[data.client].push(data);

        if (this.dataByField[data.field] === undefined) {
            this.dataByField[data.field] = [];
        }
        this.dataByField[data.field].push(data);

        this.dataByTime.push(data);
    };

    History.prototype.getByClient = function (client) {
        return this.dataByClient[client] === undefined ? [] : this.dataByClient[client];
    };

    History.prototype.getByField = function (field) {
        return this.dataByField[field] === undefined ? [] : this.dataByField[field];
    };

    History.prototype.getByTime = function () {
        return this.dataByTime;
    };

    return History;
});