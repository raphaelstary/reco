define(['lib/knockout'], function (ko) {
    function MultiViewModel(connector) {
        this.connector = connector;
        this.inputOne = ko.observable();
        this.inputOneSelected = ko.observable(false);

        this.inputOneValues = ko.observableArray([]);
        this.inputOneId = -1;
        this.counter = 0;

        this.inputOne.subscribe(function (val) {
            if (this.inputOneId == -1) {
                this.inputOneId = this.counter;
                this.counter++;
            }

            this.updateValue('inputOne', this.inputOneId, val);
        }, this);

    }

    MultiViewModel.prototype.updateValue = function (field, id, val) {
        if (val !== '') {
            var found = false;
            var index = -1;
            for (var i = 0; i < this.inputOneValues().length; i++) {
                if (this.inputOneValues()[i].id == id) {
                    found = true;
                    index = i;
                    break;
                }
            }

            if (found) {
                this.inputOneValues.remove(this.inputOneValues()[index]);
            }
            this.inputOneValues.push({
                id:id,
                text:val
            });


        }
    };

    MultiViewModel.prototype.update = function (data) {
        this[data.field](data.value);
    };

    return MultiViewModel;
});