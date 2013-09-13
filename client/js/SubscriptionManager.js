define(['constants/InputConstant', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/NotificationConstant'], function (InputConstant, HistoryConstant, MergeConstant, NotificationConstant) {
    function SubscriptionManager(view, configView, connector, brain, urlJuggler, urlParams, generateIdFn, history, historyManager) {
        this.view = view;
        this.configView = configView;
        this.connector = connector;
        this.brain = brain;
        this.urlJuggler = urlJuggler;
        this.urlParams = urlParams;
        this.generateId = generateIdFn;
        this.history = history;
        this.historyManager = historyManager;
    }

    SubscriptionManager.prototype.handleMerge = function (newVal) {
        if (newVal === undefined) {
            newVal = MergeConstant.PLAIN;
        }
        this.urlParams['merge'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);
//            this.mergeStrategy = newVal; TODO do i ned a writable merge strategy field??
    };

    SubscriptionManager.prototype.handleHistory = function (newVal) {
        if (newVal === undefined) {
            newVal = HistoryConstant.BY_TIME;
        }
        this.urlParams['history'] = newVal;
        this.urlJuggler.updateParams(this.urlParams);

        this.view.isHistoryByFieldVisible(this.configView.history() === HistoryConstant.BY_OBJECT);
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
        this.brain.clientId = newVal;
        this.configView.user(newVal);
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
                        client: self.brain.clientId,
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
        field.addEventListener('keyup', function (event) {
            var data = {
                client: self.brain.clientId,
                id: self.generateId(),
                field: key,
                value: event.target.value
            };

            self.history.add(data);
            self.connector.send(data);

            self.view.history(self.historyManager.getHistoryData(self.configView.history()));

        }, false);
    };

    return SubscriptionManager;
});