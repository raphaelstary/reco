require(['lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'MergeConstant', 'HistoryConstant',
    'NotificationConstant', 'ConfigViewModel', 'DynamicViewModel', 'utils/getValues', 'utils/parseUrlParams',
    'utils/orIfUndefined', 'lib/domReady'],
    function (ko, Connector, Brain, History, Messenger, MergeConstant, HistoryConstant, NotificationConstant, ConfigViewModel, DynamicViewModel, getValues, parseUrlParams, orIfUndefined) {

        var INPUT_PREFIX = 'input';
        var URL = location.origin;

        var connector = new Connector();
        var brain = new Brain();
        var history = new History();
        var messenger = new Messenger();

        var urlParams = parseUrlParams(location.search);

        var configView = new ConfigViewModel(getValues(MergeConstant), getValues(HistoryConstant),
            getValues(NotificationConstant),
            urlParams['merge'], urlParams['history'], urlParams['notification'], urlParams['user']);

        var mergeStrategy = orIfUndefined.call(urlParams['merge'], MergeConstant.PLAIN);
        var historyStrategy = orIfUndefined.call(urlParams['history'], HistoryConstant.BY_TIME);
        var notificationStrategy = orIfUndefined.call(urlParams['notification'], NotificationConstant.BUBBLE);

        var userName = urlParams['user'];

        var inputIds = [];
        var inputs = document.querySelectorAll('input[id*=' + INPUT_PREFIX + ']');
        for (var i = 0; i < inputs.length; i++) {
            inputIds.push(inputs[i].id);
        }

        var view = new DynamicViewModel(inputIds);

        ko.applyBindings(configView, document.getElementById('config'));
        ko.applyBindings(view, document.getElementById('mainView'));

        var mergeSubscription = configView.merge.subscribe(function (newVal) {
            console.log('merge update: ' + newVal);
        });

        var historySubscription = configView.history.subscribe(function (newVal) {
            console.log('history update: ' + newVal);
        });

        var notificationSubscription = configView.notification.subscribe(function (newVal) {
            console.log('notify update: ' + newVal);
        });

        var userSubscription = configView.user.subscribe(function (newVal) {
            console.log('user update: ' + newVal);
        });

        var subscriptionDict = {};
        Object.getOwnPropertyNames(view).forEach(function (key) {
            if (key.indexOf('input') !== -1) {
                subscriptionDict[key] = view[key].subscribe(function (newVal) {
                    var data = {
                        client: brain.clientId,
                        field: key,
                        value: newVal
                    };

                    history.add(data);
                    connector.send(data);
                });
            }
        });

        connector.connect(URL);

        connector.socket.on('info', function (data) {
            brain.register(data);
        });

        connector.socket.on('update', function (data) {
            history.add(data);

            view[data.field](data.value);
        });

    });