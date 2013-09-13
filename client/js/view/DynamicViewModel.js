define(['../lib/knockout', 'constants/HistoryConstant'], function (ko, HistoryConstant) {

    function DynamicViewModel(disabledPostfix, selectedPostfix, inputIds, history, hStrategy) {
        this.disabledPostfix = disabledPostfix;
        this.historyRepo = history;

        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + disabledPostfix] = ko.observable(false);
            self[inputId + selectedPostfix] = ko.observable(false);
        });

        this.history = ko.observable();
        this.isHistoryByFieldVisible = ko.observable(hStrategy === HistoryConstant.BY_OBJECT);
        this.isHistoryByUserVisible = ko.observable(hStrategy === HistoryConstant.BY_USER);
        this.fieldForHistory = "";
        this.userForHistory = "";
        this.users = ko.observable([]);
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

    DynamicViewModel.prototype.showHistoryByField = function (fieldId) {
        this.fieldForHistory = fieldId;
        this.history(this.historyRepo.getByField(fieldId));
    };

    DynamicViewModel.prototype.showHistoryByUser = function (userId) {
        this.userForHistory = userId;
        this.history(this.historyRepo.getByUser(userId));
    };

    return DynamicViewModel;
});