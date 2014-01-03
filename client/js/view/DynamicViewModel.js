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
        this.isHistoryByTimeVisible = ko.observable(historyStrategy === HistoryConstant.BY_TIME);
        this.isMultiMergeVisible = ko.observable(mergeStrategy === MergeConstant.MULTI);
        this.isNotificationBarVisible = ko.observable(notificationStrategy === NotificationConstant.BAR);
        this.isBubbleNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.BUBBLE);
        this.isObjectNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.OBJECT);
        this.fieldForHistory = ko.observable("");
        this.userForHistory = ko.observable("");
        this.users = ko.observable([]);

        this.notification = ko.observable();
        this.notifications = ko.observableArray();

        this.toolTipTop = ko.observable("50px");
        this.toolTipLeft = ko.observable("50px");
        this.toolTipArrow = ko.observable("right");

        this.historyTop = ko.observable();
        this.historyLeft = ko.observable();

        this.isHistoryBoxVisible = ko.computed(function () {
            return !(self.isHistoryByFieldVisible() && self.fieldForHistory() == '');
        });
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
        this.fieldForHistory(fieldId);
        this.history(this.historyRepo.getByField(fieldId));

        var rect;
        if (this.isMultiMergeVisible()) {
            rect = document.getElementById(fieldId + InputConstant.EDITABLE_POSTFIX).getBoundingClientRect();
        } else {
            rect = document.getElementById(fieldId).getBoundingClientRect();
        }

        this.historyTop(rect.top + window.scrollY - 27 + "px");
        this.historyLeft(rect.left + window.scrollX + rect.width + 25 + "px");
    };

    DynamicViewModel.prototype.showHistoryByUser = function (userId) {
        this.userForHistory(userId);
        this.history(this.historyRepo.getByUser(userId));

        var rect = document.getElementById(userId).getBoundingClientRect();

        this.historyTop(rect.top + window.scrollY + rect.height + 10 + "px");
        this.historyLeft(rect.left + window.scrollX + "px");
    };

    return DynamicViewModel;
});