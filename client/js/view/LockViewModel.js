define(['../lib/knockout'], function (ko) {
    function LockViewModel(connector) {
        this.connector = connector;
        this.inputOne = ko.observable();
        this.inputOneDisabled = ko.observable(false);
        this.inputOneSelected = ko.observable(false);
    }

    LockViewModel.prototype.update = function (data) {
        this[data.field](data.value);
    };

    LockViewModel.prototype.lock = function (data) {
        this[data.field + 'Disabled'](true);
    };

    LockViewModel.prototype.unlock = function (data) {
        this[data.field + 'Disabled'](false);
    };

    return LockViewModel;
});