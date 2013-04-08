require(['lib/knockout', 'plainviewmodel', 'connector', 'lib/domReady'], function (ko, PlainViewModel, Connector) {
    var url = 'http://localhost:8080';
    var connector = new Connector();
    connector.connect(url);
    var view = new PlainViewModel(connector);
    ko.applyBindings(view);

    view.inputOne.subscribe(function (newValue) {
        console.log("new subscribe action: " + newValue);
        connector.send({
            'user':'user1',
            'field':'inputOne',
            'value':newValue
        })
    });
    connector.socket.on('update', function (data) {
        view.update(data);
    });
});