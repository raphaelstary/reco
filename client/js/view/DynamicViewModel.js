define(['lib/knockout', 'TextToken', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/InputConstant', 'constants/NotificationConstant'], function (ko, TextToken, HistoryConstant, MergeConstant,
                                                                    InputConstant, NotificationConstant) {

    function DynamicViewModel(inputIds, history, historyStrategy, mergeStrategy, notificationStrategy) {
        this.historyRepo = history;

        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + InputConstant.DISABLED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.SELECTED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.EDITABLE_POSTFIX] = ko.observable();
        });

        this.history = ko.observable();
        this.isHistoryByFieldVisible = ko.observable(historyStrategy === HistoryConstant.BY_OBJECT);
        this.isHistoryByUserVisible = ko.observable(historyStrategy === HistoryConstant.BY_USER);
        this.isMultiMergeVisible = ko.observable(mergeStrategy === MergeConstant.MULTI);
        this.isNotificationBarVisible = ko.observable(notificationStrategy === NotificationConstant.BAR);
        this.isBubbleNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.BUBBLE);
        this.fieldForHistory = "";
        this.userForHistory = "";
        this.users = ko.observable([]);

        this.notification = ko.observable();
        this.notifications = ko.observableArray();
    }

    DynamicViewModel.prototype.update = function (fieldId, value, markupValue) {
        this[fieldId](value);
        if (markupValue != null && markupValue.length > 0)
            this[fieldId + InputConstant.EDITABLE_POSTFIX](markupValue);
    };

    DynamicViewModel.prototype.lock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](true);
    };

    DynamicViewModel.prototype.unlock = function (fieldId) {
        this[fieldId + InputConstant.DISABLED_POSTFIX](false);
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