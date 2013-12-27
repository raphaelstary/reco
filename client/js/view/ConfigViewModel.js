define(['../lib/knockout'], function (ko) {
    function ConfigViewModel(mergeValues, historyValues, notificationValues, merge, history, notification, user, cssClass) {
        this.mergeValues = mergeValues;
        this.historyValues = historyValues;
        this.notificationValues = notificationValues;

        this.merge = ko.observable(merge);
        this.history = ko.observable(history);
        this.notification = ko.observable(notification);
        this.user = ko.observable(user);
        this.cssClass = ko.observable(cssClass);
    }

    return ConfigViewModel;
});