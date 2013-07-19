require(['lib/knockout', 'view/PlainViewModel', 'Connector', 'Brain', 'History', 'lib/domReady'], function (ko, PlainViewModel, Connector, Brain, History) {
    var url = 'http://localhost:8080';

    var connector = new Connector();
    var brain = new Brain();
    var history = new History();

    connector.connect(url);

    var view = new PlainViewModel(history);
    ko.applyBindings(view);

    view.inputOne.subscribe(function (newValue) {
        console.log("new subscribe action: " + newValue);

        var data = {
            'client':brain.clientId,
            'field':'inputOne',
            'value':newValue
        };

        history.add(data);
        view.historyByTime.push(data);
        connector.send(data);
    });

    view.inputTwo.subscribe(function (newValue) {
        console.log("new subscribe action: " + newValue);

        var data = {
            'client':brain.clientId,
            'field':'inputTwo',
            'value':newValue
        };

        history.add(data);
        view.historyByTime.push(data);
        connector.send(data);
    });

    connector.socket.on('info', function (data) {
        brain.register(data);
    });

    connector.socket.on('update', function (data) {
        history.add(data);
        view.historyByTime.push(data);
        view.update(data);
    });
});