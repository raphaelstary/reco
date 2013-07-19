define(['../lib/knockout'], function (ko) {
    function ConfigViewModel(mergeValues, historyValues, notificationValues, merge, history, notification, user) {
        this.mergeValues = mergeValues;
        this.historyValues = historyValues;
        this.notificationValues = notificationValues;
        this.merge = merge !== null ? ko.observable(merge) : ko.observable();
        this.history = history !== null ? ko.observable(history) : ko.observable();
        this.notification = notification !== null ? ko.observable(notification) : ko.observable();
        this.user = user !== null ? ko.observable(user) : ko.observable();
    }

    return ConfigViewModel;
});