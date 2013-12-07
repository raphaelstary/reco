define(['constants/InputConstant', 'constants/HistoryConstant', 'constants/MergeConstant',
    'constants/NotificationConstant', 'lib/knockout', 'TextToken', 'utils/generateId'], function (InputConstant,
    HistoryConstant, MergeConstant, NotificationConstant, ko, TextToken, generateId) {
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
        field.addEventListener('keyup', function (event) {

            //is multi merge
            if (self.configView.merge() === MergeConstant.MULTI) {
                var valuesConcat = "";

                var noActiveToken = true;

                ko.utils.arrayForEach(self.view[key + InputConstant.VALUES_POSTFIX](), function (valueObj) {
                    if (valueObj.active()) {
                        valueObj.value(event.target.value);
                        noActiveToken = false;
                    }

                    valuesConcat += valueObj.value();
                });

                if (noActiveToken) {
                    self.view[key + InputConstant.VALUES_POSTFIX].push(new TextToken(generateId(), event.target.value, true));
                    valuesConcat = event.target.value;
                }
                self._newValueFromUser(key, valuesConcat, ko.toJSON(self.view[key + InputConstant.VALUES_POSTFIX]()));

            } else { //normal everything else
                self._newValueFromUser(key, event.target.value);
            }
        });
    };

    SubscriptionManager.prototype._newValueFromUser = function (key, value, multiList) {
        var self = this;
        var data = {
            user: self.brain.userId,
            id: self.generateId(),
            field: key,
            value: value,
            multiValues: multiList
        };

        self.history.add(data);
        self.connector.send(data);

        self.view.users(self.history.getAllUsers());
        self.view.history(self.historyManager.getHistoryData(self.configView.history()));
    };

    return SubscriptionManager;
});