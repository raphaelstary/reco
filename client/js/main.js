require(['lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'constants/MergeConstant', 'constants/HistoryConstant',
    'constants/NotificationConstant', 'view/ConfigViewModel', 'view/DynamicViewModel', 'utils/getValues', 'utils/parseUrlParams',
    'utils/orIfUndefined', 'UrlJuggler', 'lib/domReady'], function (ko, Connector, Brain, History, Messenger, MergeConstant, HistoryConstant, NotificationConstant, ConfigViewModel, DynamicViewModel, getValues, parseUrlParams, orIfUndefined, UrlJuggler) {

    var INPUT_PREFIX = 'input';
    var INPUT_DISABLED_POSTFIX = 'Disabled';
    var INPUT_SELECTED_POSTFIX = 'Selected';

    var URL = location.origin;

    var connector = new Connector();
    var brain = new Brain();
    var history = new History();
    var messenger = new Messenger();
    var urlJuggler = new UrlJuggler(location.pathname, window.history.pushState.bind(window.history));
    var urlParams = parseUrlParams(location.search);

    var configView = new ConfigViewModel(getValues(MergeConstant), getValues(HistoryConstant),
        getValues(NotificationConstant),
        urlParams['merge'], urlParams['history'], urlParams['notification'], urlParams['user']);

    var mergeStrategy = orIfUndefined.call(urlParams['merge'], MergeConstant.PLAIN);
    var historyStrategy = orIfUndefined.call(urlParams['history'], HistoryConstant.BY_TIME);
    var notificationStrategy = orIfUndefined.call(urlParams['notification'], NotificationConstant.BUBBLE);

    var userName = urlParams['user'];

    if (userName !== undefined) {
        brain.clientId = userName;
    }

    var inputIds = [];
    var inputs = document.querySelectorAll('input[id*=' + INPUT_PREFIX + ']');
    for (var i = 0; i < inputs.length; i++) {
        inputIds.push(inputs[i].id);
    }

    var view = new DynamicViewModel(INPUT_DISABLED_POSTFIX, INPUT_SELECTED_POSTFIX, inputIds);

    ko.applyBindings(configView, document.getElementById('config'));
    ko.applyBindings(view, document.getElementById('mainView'));

    var mergeSubscription = configView.merge.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = MergeConstant.PLAIN;
        }
        urlParams['merge'] = newVal;
        urlJuggler.updateParams(urlParams);
        mergeStrategy = newVal;
    });

    var historySubscription = configView.history.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = HistoryConstant.BY_TIME;
        }
        urlParams['history'] = newVal;
        urlJuggler.updateParams(urlParams);
    });

    var notificationSubscription = configView.notification.subscribe(function (newVal) {
        if (newVal === undefined) {
            newVal = NotificationConstant.BUBBLE;
        }
        urlParams['notification'] = newVal;
        urlJuggler.updateParams(urlParams);
    });

    var userSubscription = configView.user.subscribe(function (newVal) {
        if (newVal === undefined || newVal === null || newVal.trim() === '') {
            newVal = 'pikatchu';
        }

        urlParams['user'] = newVal;
        urlJuggler.updateParams(urlParams);
        brain.clientId = newVal;
        configView.user(newVal);
    });

    var isInputVar = function (key) {
        return key.toUpperCase().indexOf(INPUT_PREFIX.toUpperCase()) !== -1 &&
            key.toUpperCase().indexOf(INPUT_DISABLED_POSTFIX.toUpperCase()) === -1 &&
            key.toUpperCase().indexOf(INPUT_SELECTED_POSTFIX.toUpperCase()) === -1
    };

    var isSelectVar = function (key) {
        return key.toUpperCase().indexOf(INPUT_PREFIX.toUpperCase()) !== -1 &&
            key.toUpperCase().indexOf(INPUT_DISABLED_POSTFIX.toUpperCase()) === -1 &&
            key.toUpperCase().indexOf(INPUT_SELECTED_POSTFIX.toUpperCase()) !== -1;
    };

    var subscriptionDict = {};
    Object.getOwnPropertyNames(view).forEach(function (key) {

        if (isInputVar(key)) {

            subscriptionDict[key] = view[key].subscribe(function (newVal) {

                console.log('update from: ' + key + ' with value: ' + newVal);

                var data = {
                    client: brain.clientId,
                    field: key,
                    value: newVal
                };

                history.add(data);
                connector.send(data);
                view.addHistoryByTime(data);
            });

        } else if (isSelectVar(key)) {
            subscriptionDict[key] = view[key].subscribe(function (newVal) {

                console.log('update from: ' + key + ' with value: ' + newVal);

                if (mergeStrategy == MergeConstant.LOCK) {

                    var data = {
                        client: brain.clientId,
                        field: key.slice(0, -INPUT_SELECTED_POSTFIX.length)
                    };

                    if (newVal) {
                        connector.lock(data);
                    } else {
                        connector.unlock(data);
                    }
                }
            });
        }
    });

    connector.connect(URL);

    connector.socket.on('info', function (data) {
        brain.register(data, configView.user);
    });

    connector.socket.on('update', function (data) {
        history.add(data);
        view.update(data.field, data.value);
    });

    connector.socket.on('unlock', function (data) {
        view.unlock(data.field);
    });

    connector.socket.on('lock', function (data) {
        view.lock(data.field);
    });

    //todo nxt steps:
    // select predefined strategies
    //dann fix HbT user issue
    //dann history by time -> user -> object
    //dann multi merge
    //dann notifications

});