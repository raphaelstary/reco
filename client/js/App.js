define(function () {
    function App(view, configView, connector, subscriptionManager, connectionManager) {
        this.view = view;
        this.configView = configView;
        this.connector = connector;
        this.subscriptionManager = subscriptionManager;
        this.connectionManager = connectionManager;
    }

    App.prototype.setUpInputSubscriptions = function (inputs) {
        for (var i = 0; i < inputs.length; i++) {
            this.subscriptionManager.handleDynamicInputChangeOnlyByUser(inputs[i], inputs[i].id);
        }

        this.configView.merge.subscribe(this.subscriptionManager.handleMerge.bind(this.subscriptionManager));

        this.configView.history.subscribe(this.subscriptionManager.handleHistory.bind(this.subscriptionManager));

        this.configView.notification.subscribe(this.subscriptionManager.handleNotification.bind(this.subscriptionManager));

        this.configView.user.subscribe(this.subscriptionManager.handleUser.bind(this.subscriptionManager));

        Object.getOwnPropertyNames(this.view).forEach(
            this.subscriptionManager.handleAllDynamicInputChange.bind(this.subscriptionManager));
    };

    App.prototype.setUpConnection = function (url) {
        this.connector.connect(url);

        this.connector.socket.on('info', this.connectionManager.handleInfo.bind(this.connectionManager));

        this.connector.socket.on('update', this.connectionManager.handleUpdate.bind(this.connectionManager));

        this.connector.socket.on('unlock', this.connectionManager.handleUnlock.bind(this.connectionManager));

        this.connector.socket.on('lock', this.connectionManager.handleLock.bind(this.connectionManager));
    };

    return App;
});