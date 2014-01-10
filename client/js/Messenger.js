define(['constants/NotificationConstant', 'constants/InputConstant'], function (NotificationConstant, InputConstant) {
    function Messenger(notificationStrategy, view) {
        this.currentStrategy = notificationStrategy;
        this.view = view;
    }

    Messenger.prototype.push = function (data) {
        var rect;
        var self = this;
        if (this.currentStrategy === NotificationConstant.BAR) {

            if (this.view.barUser() != null && this.view.barField() != null && this.timeoutBarId != null) {
                clearTimeout(this.timeoutBarId);
            }

            this.view.barUser(data.user);
            this.view.barField(data.field);

            this.timeoutBarId = setTimeout(function () {
                self.view.barUser(null);
                self.view.barField(null);
            }, 5000);

        } else if (this.currentStrategy === NotificationConstant.BUBBLE) {
            var last = this.view.notifications()[this.view.notifications().length - 1];

            if (last != null && last.user == data.user && last.field == data.field && this.timeoutId != null) {

                clearTimeout(this.timeoutId);
                this.timeoutId = setTimeout(function () {
                    self.view.notifications.remove(last);
                }, 3000);

            } else {
                this.view.notifications.push(data);

                this.timeoutId = (function removeAgain(data, self) {
                    return setTimeout(function () {
                        self.view.notifications.remove(data);
                    }, 3000);
                })(data, this);
            }



        } else if (this.currentStrategy === NotificationConstant.OBJECT) {
            this.view.isToolTipVisible(true);

            this.view.barUser(data.user);
            this.view.barField(data.field);

            if (this.view.isMultiMergeVisible()) {
                rect = document.getElementById(data.field + InputConstant.EDITABLE_POSTFIX).getBoundingClientRect();
            } else {
                rect = document.getElementById(data.field).getBoundingClientRect();
            }

            if (rect.bottom < window.scrollY) {
                this.view.toolTipLeft(rect.left + window.scrollX + rect.width + "px");
                this.view.toolTipTop(50 + window.scrollY + "px");
                this.view.toolTipArrow("bottom");

            } else if (rect.top > (window.scrollY + window.innerHeight)) {
                this.view.toolTipLeft(rect.left + window.scrollX + rect.width + "px");
                this.view.toolTipTop(window.innerHeight - 50 + window.scrollY + "px");
                this.view.toolTipArrow("top");

            } else {
                this.view.toolTipLeft(rect.left + window.scrollX + rect.width + "px");
                this.view.toolTipTop(rect.top + window.scrollY + "px");
                this.view.toolTipArrow("right");
            }

            clearTimeout(this.timeoutObjectId);

            this.timeoutObjectId = setTimeout(function () {
                self.view.isToolTipVisible(false);
            }, 5000);

        } else if (this.currentStrategy === NotificationConstant.DYNAMIC_DOM) {

            if (this.view.isMultiMergeVisible()) {
                rect = document.getElementById(data.field + InputConstant.EDITABLE_POSTFIX).getBoundingClientRect();
            } else {
                rect = document.getElementById(data.field).getBoundingClientRect();
            }

            this.view.clearAllDynamic();
            this.view.isDynamicBottom(false);
            this.view.isDynamicTop(false);

            if (rect.bottom < 40) {
                //top
                this.view.isDynamicTop(true);
                this.view[data.field + InputConstant.DYNAMIC_POSTFIX](true);

            } else if (rect.top > (window.scrollY + window.innerHeight)) {
                //bottom
                this.view.isDynamicBottom(true);
                this.view[data.field + InputConstant.DYNAMIC_POSTFIX](true);
            }

        }
    };

    Messenger.prototype.update = function (notificationStrategy) {
        this.currentStrategy = notificationStrategy;
    };

    return Messenger;
});