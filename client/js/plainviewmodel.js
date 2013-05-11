define(['lib/knockout'], function (ko) {
    function PlainViewModel(history) {
        this.history = history;
        this.inputOne = ko.observable();
        this.inputTwo = ko.observable();
        this.shouldShowHistoryByField = ko.observable(false);
        this.historyByField = ko.observableArray();
        this.historyByTime = ko.observableArray();
        this.historyByClient = ko.observableArray();
    }

    PlainViewModel.prototype.update = function (data) {
        this[data.field](data.value);
    };

    PlainViewModel.prototype.showHistoryByField = function (field) {
        this.historyByField.removeAll();

        var tmpHistory = this.history.getByField(field);

        //todo change worst thing ever for ko perf -> addAll with mute two way binding for operation
        var self = this;
        tmpHistory.forEach(function (elem) {
            self.historyByField.push(elem);
        });

        this.shouldShowHistoryByField(true);
    };

    return PlainViewModel;
});