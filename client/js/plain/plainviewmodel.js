define(['lib/knockout'], function (ko) {
    function LockViewModel(connector) {
        this.connector = connector;
        this.inputOneDisabled = ko.observable(false);
        this.inputOne = ko.observable();

    }

    LockViewModel.prototype.update = function (data) {
        this[data.field](data.value);
    };

    return LockViewModel;
});