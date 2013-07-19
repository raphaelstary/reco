require(['lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'MergeConstant', 'HistoryConstant',
    'NotificationConstant', 'ConfigViewModel', 'DynamicViewModel', 'utils/getValues', 'utils/parseUrlParams',
    'utils/orIfUndefined', 'UrlJuggler', 'lib/domReady'],
    function (ko, Connector, Brain, History, Messenger, MergeConstant, HistoryConstant, NotificationConstant,
              ConfigViewModel, DynamicViewModel, getValues, parseUrlParams, orIfUndefined, UrlJuggler) {

        var INPUT_PREFIX = 'input';
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

            urlParams['merge'] = newVal;
            urlJuggler.updateParams(urlParams);
        });

        var historySubscription = configView.history.subscribe(function (newVal) {
            console.log('history update: ' + newVal);

            urlParams['history'] = newVal;
            urlJuggler.updateParams(urlParams);
        });

        var notificationSubscription = configView.notification.subscribe(function (newVal) {
            console.log('notify update: ' + newVal);

            urlParams['notification'] = newVal;
            urlJuggler.updateParams(urlParams);
        });

        var userSubscription = configView.user.subscribe(function (newVal) {
            console.log('user update: ' + newVal);

            urlParams['user'] = newVal;
            urlJuggler.updateParams(urlParams);
        });

        var subscriptionDict = {};
        Object.getOwnPropertyNames(view).forEach(function (key) {
            if (key.indexOf('input') !== -1) {
                subscriptionDict[key] = view[key].subscribe(function (newVal) {

                    console.log('update from: ' + key + ' with value: ' + newVal);

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
            console.log('new socket info with data: ' + data);

            brain.register(data);
        });

        connector.socket.on('update', function (data) {
            console.log('new socket update with data: ' + data);

            history.add(data);

            view[data.field](data.value);
        });

    });