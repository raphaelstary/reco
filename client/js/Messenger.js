define(['constants/NotificationConstant'], function (NotificationConstant) {
    function Messenger(notificationStrategy, view) {
        this.currentStrategy = notificationStrategy;
        this.view = view;
    }

    Messenger.prototype.push = function (data) {
        if (this.currentStrategy === NotificationConstant.BAR) {
            this.view.notification("user " + data.user + " is typing in " + data.field);

        } else if (this.currentStrategy === NotificationConstant.BUBBLE) {
            this.view.notifications.push(data);

            (function removeAgain(data, self) {
                setTimeout(function () {
                    self.view.notifications.remove(data);
                }, 3000);
            })(data, this);

        } else if (this.currentStrategy === NotificationConstant.OBJECT) {
            this.view.notification("user " + data.user + " is typing in " + data.field);

            var rect = document.getElementById(data.field).getBoundingClientRect();
            this.view.toolTipLeft(rect.left + rect.width + "px");
            this.view.toolTipTop(rect.top + "px");
        }
    };

    Messenger.prototype.update = function (notificationStrategy) {
        this.currentStrategy = notificationStrategy;
    };

    return Messenger;
});