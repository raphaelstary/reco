define(['lib/knockout'], function (ko) {
    function PlainViewModel(connector) {
        this.connector = connector;
        this.inputOne = ko.observable();

    }

    PlainViewModel.prototype.update = function (data) {
        this[data.field](data.value);
    };

    return PlainViewModel;
});