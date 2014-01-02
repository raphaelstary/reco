define(['constants/InputConstant', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/NotificationConstant', 'lib/knockout', 'TextToken', 'utils/generateId'], function (InputConstant, HistoryConstant, MergeConstant, NotificationConstant, ko, TextToken, generateId) {
    function SubscriptionManager(view, configView, connector, brain, urlJuggler, urlParams, generateIdFn, history, historyManager, messenger) {
        this.view = view;
        this.configView = configView;
        this.connector = connector;
        this.brain = brain;
        this.urlJuggler = urlJuggler;
        this.urlParams = urlParams;
        this.generateId = generateIdFn;
        this.history = history;
        this.historyManager = historyManager;
        this.messenger = messenger;
    }

    SubscriptionManager.prototype.handleMerge = function (newVal) {
        if (newVal === undefined) {
            newVal = MergeConstant.PLAIN;
        }
        this.urlParams['merge'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);

        this.view.isMultiMergeVisible(newVal === MergeConstant.MULTI);
    };

    SubscriptionManager.prototype.handleHistory = function (newVal) {
        if (newVal === undefined) {
            newVal = HistoryConstant.BY_TIME;
        }
        this.urlParams['history'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);

        var history = this.configView.history(); // why not newVal? is there a diff? what did i do!
        this.view.history(this.historyManager.getHistoryData(history));
        this.view.isHistoryByFieldVisible(history === HistoryConstant.BY_OBJECT);
        this.view.isHistoryByUserVisible(history === HistoryConstant.BY_USER);
        if (history === HistoryConstant.BY_USER) {
            this.view.users(this.history.getAllUsers())
        }
    };

    SubscriptionManager.prototype.handleNotification = function (newVal) {
        if (newVal === undefined) {
            newVal = NotificationConstant.BUBBLE;
        }
        this.urlParams['notification'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);
    };

    SubscriptionManager.prototype.handleUser = function (newVal) {
        if (newVal === undefined || newVal === null || newVal.trim() === '') {
            newVal = 'pikatchu';
        }

        this.urlParams['user'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);
        this.brain.userId = newVal;
    };

    SubscriptionManager.prototype.handleCssClass = function (newVal) {
        if (newVal === undefined || newVal === null || newVal.trim() === '') {
            newVal = 'user-one';
        }

        this.urlParams['css'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);
        this.brain.cssClass = newVal;
    };

    SubscriptionManager.prototype.isSelectVar = function (key) {
        return key.toUpperCase().indexOf(InputConstant.PREFIX.toUpperCase()) !== -1 &&
            key.toUpperCase().indexOf(InputConstant.DISABLED_POSTFIX.toUpperCase()) === -1 &&
            key.toUpperCase().indexOf(InputConstant.SELECTED_POSTFIX.toUpperCase()) !== -1;
    };

    SubscriptionManager.prototype.handleAllDynamicInputChange = function (key) {
        var self = this;
        if (this.isSelectVar(key)) {
            this.view[key].subscribe(function (newVal) {

                if (self.configView.merge() == MergeConstant.LOCK) {

                    var data = {
                        user: self.brain.userId,
                        field: key.slice(0, -InputConstant.SELECTED_POSTFIX.length)
                    };

                    if (newVal) {
                        self.connector.lock(data);
                    } else {
                        self.connector.unlock(data);
                    }
                }
            });
        }
    };

    SubscriptionManager.prototype.handleDynamicInputChangeOnlyByUser = function (field, key) {
        var self = this;
        field.addEventListener('keydown', function (event) {
            setTimeout(function () {
                self._newValueFromUser(key, event.target.value);
            }, 0);
        });
    };

    SubscriptionManager.prototype.handleContentEditable = function (key, value, htmlValue) {
        this._newValueFromUser(key.substring(0, key.length - InputConstant.EDITABLE_POSTFIX.length), value, htmlValue);
    };

    SubscriptionManager.prototype._newValueFromUser = function (key, value, htmlValue) {
        var self = this;
        var data = {
            user: self.brain.userId,
            id: self.generateId(),
            field: key,
            value: value,
            htmlValue: htmlValue
        };

//        self.messenger.push(data);
        self.history.add(data);
        self.connector.send(data);

        self.view.users(self.history.getAllUsers());
        self.view.history(self.historyManager.getHistoryData(self.configView.history()));
    };

    return SubscriptionManager;
});