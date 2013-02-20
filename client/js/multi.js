require(['lib/knockout', 'multiviewmodel', 'connector', 'lib/domReady'], function (ko, MultiViewModel, Connector) {
    var url = 'http://localhost:8080';
    var connector = new Connector();
    connector.connect(url);
    var view = new MultiViewModel(connector);
    ko.applyBindings(view);

    var id = Math.floor(Math.random()*101);

    view.inputOne.subscribe(function (newValue) {
        connector.send({
            'id': id,
            'user':'user1',
            'field':'inputOne',
            'value':newValue
        });
    });

    view.inputOneSelected.subscribe(function (newValue) {
        var data = {
            'user':'user1',
            'field':'inputOne'
        };
    });

    connector.socket.on('update', function (data) {
        view.updateValue(data.field, data.id, data.value);
    });

});