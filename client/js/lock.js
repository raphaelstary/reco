require(['lib/knockout', 'lockviewmodel', 'connector', 'lib/domReady'], function (ko, LockViewModel, Connector) {
    var url = 'http://localhost:8080';
    var connector = new Connector();
    connector.connect(url);
    var view = new LockViewModel(connector);
    ko.applyBindings(view);

    view.inputOne.subscribe(function (newValue) {
        connector.send({
            'client':'user1',
            'field':'inputOne',
            'value':newValue
        })
    });

    view.inputOneSelected.subscribe(function (newValue) {
        var data = {
            'client':'user1',
            'field':'inputOne'
        };

        if (newValue)
            connector.lock(data);
        else
            connector.unlock(data);
    });

    connector.socket.on('update', function (data) {
        view.update(data);
    });

    connector.socket.on('lock', function (data) {
        view.lock(data);
    });

    connector.socket.on('unlock', function (data) {
        view.unlock(data);
    });
});