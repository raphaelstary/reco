define(['lib/knockout'], function (ko) {
    function DynamicViewModel(inputIds) {
        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
        });
    }

    return DynamicViewModel;
});