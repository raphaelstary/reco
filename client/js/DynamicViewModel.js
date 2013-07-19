define(['lib/knockout'], function (ko) {
    function DynamicViewModel(disabledPostfix, selectedPostfix, inputIds) {
        this.disabledPostfix = disabledPostfix;
        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + disabledPostfix] = ko.observable(false);
            self[inputId + selectedPostfix] = ko.observable(false);
        });
    }

    DynamicViewModel.prototype.update = function (fieldId, value) {
        this[fieldId](value);
    };

    DynamicViewModel.prototype.lock = function (fieldId) {
        this[fieldId + this.disabledPostfix](true);
    };

    DynamicViewModel.prototype.unlock = function (fieldId) {
        this[fieldId + this.disabledPostfix](false);
    };

    return DynamicViewModel;
});