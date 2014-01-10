define(function () {
    function ConnectionManager(view, configView, brain, historyManager, history, messenger) {
        this.view = view;
        this.configView = configView;
        this.brain = brain;
        this.historyManager = historyManager;
        this.history = history;
        this.messenger = messenger;
    }

    ConnectionManager.prototype.handleInfo = function (data) {

        if (data.state === 'new') {
            if (this.brain.userId === undefined && data.state === 'new' && data.user !== undefined) {
                this.configView.user(data.user);
            }

            if (this.brain.cssClass === undefined && data.css !== undefined) {
                this.configView.cssClass(data.css);
            }
        }
    };

    ConnectionManager.prototype.handleUpdate = function (data) {
        if (this.brain.oldData != null && this.brain.oldData.field == data.field) {
            if (this.brain.oldData.value == data.value) {
                return;
            } else if (Array.isArray(this.brain.oldData.value) && Array.isArray(data.value)) {
                var expected = this.brain.oldData.value;
                var actual = data.value;

                if (expected.length == actual.length) {
                    var equals = true;
                    for (var i = 0; i < expected.length; i++) {
                        if (expected[i] != actual[i]) {
                            equals = false;
                            break;
                        }
                    }
                    if (equals) {
                        return;
                    }
                }
            }
        }

        this.messenger.push(data);
        this.history.add(data);
        this.view.update(data.field, data.value, data.htmlValue);

        this.view.users(this.history.getAllUsers());
        this.view.history(this.historyManager.getHistoryData(this.configView.history()));
    };

    ConnectionManager.prototype.handleUnlock = function (data) {
        this.view.unlock(data.field);
    };

    ConnectionManager.prototype.handleLock = function (data) {
        this.view.lock(data.field);
    };

    return ConnectionManager;
});