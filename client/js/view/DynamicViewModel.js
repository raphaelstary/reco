define(['lib/knockout', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/InputConstant', 'constants/NotificationConstant'], function (ko, HistoryConstant, MergeConstant, InputConstant, NotificationConstant) {

    function DynamicViewModel(inputIds, history, historyStrategy, mergeStrategy, notificationStrategy) {
        this.historyRepo = history;

        var self = this;
        inputIds.forEach(function (inputId) {
            self[inputId] = ko.observable();
            self[inputId + InputConstant.DISABLED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.SELECTED_POSTFIX] = ko.observable(false);
            self[inputId + InputConstant.EDITABLE_POSTFIX] = ko.observable();
            self[inputId + InputConstant.DYNAMIC_POSTFIX] = ko.observable(false);

            self[inputId + InputConstant.SCROLL_POSTFIX] = function () {
                var elem;
                if (self.isMultiMergeVisible()) {
                    elem = document.getElementById(inputId + InputConstant.EDITABLE_POSTFIX);
                } else {
                    elem = document.getElementById(inputId);
                }
                elem.scrollIntoView(self.isDynamicBottom());
                self.isDynamicBottom(false);
                self.isDynamicTop(false);
                self[inputId + InputConstant.DYNAMIC_POSTFIX](false);
            };

            if (inputId.toUpperCase().indexOf(InputConstant.DISABLED_POSTFIX.toUpperCase()) !== -1) {
                self[inputId] = ko.observableArray();
            }
        });

        this.clearAllDynamic = function () {
            inputIds.forEach(function (inputId) {
                self[inputId + InputConstant.DYNAMIC_POSTFIX](false);
            });
        };

        this.history = ko.observable();
        this.isHistoryByFieldVisible = ko.observable(historyStrategy === HistoryConstant.BY_OBJECT);
        this.isHistoryByUserVisible = ko.observable(historyStrategy === HistoryConstant.BY_USER);
        this.isHistoryByTimeVisible = ko.observable(historyStrategy === HistoryConstant.BY_TIME);
        this.isMultiMergeVisible = ko.observable(mergeStrategy === MergeConstant.MULTI);
        this.isNotificationBarVisible = ko.observable(notificationStrategy === NotificationConstant.BAR);
        this.isBubbleNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.BUBBLE);
        this.isObjectNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.OBJECT);
        this.isDynamicNotificationVisible = ko.observable(notificationStrategy === NotificationConstant.DYNAMIC_DOM);
        this.fieldForHistory = ko.observable("");
        this.userForHistory = ko.observable("");
        this.users = ko.observable([]);

        this.notifications = ko.observableArray();

        this.toolTipTop = ko.observable();
        this.toolTipLeft = ko.observable();
        this.toolTipArrow = ko.observable();

        this.historyTop = ko.observable();
        this.historyLeft = ko.observable();

        this.isHistoryBoxVisible = ko.computed(function () {
            return !(self.isHistoryByFieldVisible() && self.fieldForHistory() == '');
        });

        this.barUser = ko.observable();
        this.barField = ko.observable();

        this.isBarInfoVisible = ko.computed(function () {
            return self.barUser() != null && self.barUser() != "";
        });

        this.isToolTipVisible = ko.observable(false);

        this.isDynamicNotificationFieldVisible = ko.computed(function () {
            var isVisible = false;
            for (var i = 0; i < inputIds.length; i++) {
                if (self[inputIds[i] + InputConstant.DYNAMIC_POSTFIX]()) {
                    isVisible = true;
                    break;
                }
            }
            return isVisible;
        });

        this.isDynamicTop = ko.observable(false);
        this.isDynamicBottom = ko.observable(false);

        this.isDynamicTopVisible = ko.computed(function () {
            return self.isDynamicTop() && self.isDynamicNotificationFieldVisible();
        });

        this.isDynamicBottomVisible = ko.computed(function () {
            return self.isDynamicBottom() && self.isDynamicNotificationFieldVisible();
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
            if (document.getElementById(fieldId + InputConstant.EDITABLE_POSTFIX) != null) {
                rect = document.getElementById(fieldId + InputConstant.EDITABLE_POSTFIX).getBoundingClientRect();
            } else {
                rect = document.getElementById(fieldId).getBoundingClientRect();
            }

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

    DynamicViewModel.prototype.scrollToFieldFromBar = function () {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(this.barField() + InputConstant.EDITABLE_POSTFIX);
            if (elem == null) {
                elem = document.getElementById(this.barField());
            }
        } else {
            elem = document.getElementById(this.barField());
        }
        elem.scrollIntoView();
    };

    DynamicViewModel.prototype.scrollToFieldFromBubble = function (bubble) {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(bubble.field + InputConstant.EDITABLE_POSTFIX);
            if (elem == null) {
                elem = document.getElementById(bubble.field);
            }
        } else {
            elem = document.getElementById(bubble.field);
        }
        elem.scrollIntoView();
    };

    DynamicViewModel.prototype.scrollToFieldFromToolTip = function () {
        var elem;
        if (this.isMultiMergeVisible()) {
            elem = document.getElementById(this.barField() + InputConstant.EDITABLE_POSTFIX);
            if (elem == null) {
                elem = document.getElementById(this.barField());
            }
        } else {
            elem = document.getElementById(this.barField());
        }
        elem.scrollIntoView();

        this.isToolTipVisible(false);
    };

    return DynamicViewModel;
});