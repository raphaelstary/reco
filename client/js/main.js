require(['require', 'lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'constants/MergeConstant',
    'constants/HistoryConstant', 'constants/NotificationConstant', 'view/ConfigViewModel', 'view/DynamicViewModel',
    'utils/getValues', 'utils/parseUrlParams', 'UrlJuggler', 'constants/InputConstant', 'App',
    'ConnectionManager', 'HistoryManager', 'SubscriptionManager', 'view/ContentEditableBinding',
    'lib/domReady'], function (require) {

    require('lib/domReady');
    var ko = require('lib/knockout'),
        getContentEditableBinding = require('view/ContentEditableBinding'),
        Connector = require('Connector'),
        Brain = require('Brain'),
        History = require('History'),
        Messenger = require('Messenger'),
        MergeConstant = require('constants/MergeConstant'),
        HistoryConstant = require('constants/HistoryConstant'),
        NotificationConstant = require('constants/NotificationConstant'),
        ConfigViewModel = require('view/ConfigViewModel'),
        DynamicViewModel = require('view/DynamicViewModel'),
        getValues = require('utils/getValues'),
        parseUrlParams = require('utils/parseUrlParams'),
        UrlJuggler = require('UrlJuggler'),
        InputConstant = require('constants/InputConstant'),
        App = require('App'),
        ConnectionManager = require('ConnectionManager'),
        HistoryManager = require('HistoryManager'),
        SubscriptionManager = require('SubscriptionManager');

    var URL = location.origin;

    var connector = new Connector();
    var brain = new Brain();
    var history = new History();

    var urlJuggler = new UrlJuggler(location.pathname, window.history.pushState.bind(window.history));
    var urlParams = parseUrlParams(location.search);


    var mergeParam = urlParams['merge'];
    var mergeStrategy = mergeParam !== undefined ? mergeParam : MergeConstant.PLAIN;
    var historyParam = urlParams['history'];
    var historyStrategy = historyParam !== undefined ? historyParam : HistoryConstant.BY_TIME;
    var notifyParam = urlParams['notification'];
    var notificationStrategy = notifyParam !== undefined ? notifyParam : NotificationConstant.BUBBLE;

    var configView = new ConfigViewModel(getValues(MergeConstant), getValues(HistoryConstant),
        getValues(NotificationConstant),
        mergeStrategy, historyStrategy, notificationStrategy, urlParams['user']);



    var userName = urlParams['user'];

    if (userName !== undefined) {
        brain.userId = userName;
    }

    if (urlParams['css'] !== undefined) {
        brain.cssClass = urlParams['css'];
    }

    var inputIds = [];
    var inputs = document.querySelectorAll('input[id*=' + InputConstant.PREFIX + ']');
    for (var i = 0; i < inputs.length; i++) {
        inputIds.push(inputs[i].id);
    }

    var view = new DynamicViewModel(inputIds, history, configView.history(), configView.merge(), configView.notification());

    var messenger = new Messenger(notificationStrategy, view);

    var historyManager = new HistoryManager(history, view);
    var subscriptionManager = new SubscriptionManager(view, configView, connector, brain, urlJuggler, urlParams,
        history, historyManager, messenger);
    var connectionManager = new ConnectionManager(view, configView, brain, historyManager, history, messenger);
    
    ko.bindingHandlers.contentEditable = getContentEditableBinding(brain, subscriptionManager);

    ko.applyBindings(configView, document.getElementById('config'));
    ko.applyBindings(view, document.getElementById('mainView'));
    
    var app = new App(view, configView, connector, subscriptionManager, connectionManager);
    app.setUpInputSubscriptions(inputs);
    app.setUpConnection(URL);
});