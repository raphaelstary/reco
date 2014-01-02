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

//        this.messenger.push(data);
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