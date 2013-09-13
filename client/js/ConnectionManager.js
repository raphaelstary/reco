define(function () {
    function ConnectionManager(view, configView, brain, historyManager, history) {
        this.view = view;
        this.configView = configView;
        this.brain = brain;
        this.historyManager = historyManager;
        this.history = history;
    }

    ConnectionManager.prototype.handleInfo = function (data) {
        this.brain.register(data, this.configView.user);
    };

    ConnectionManager.prototype.handleUpdate = function (data) {
        this.history.add(data);
        this.view.update(data.field, data.value);

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