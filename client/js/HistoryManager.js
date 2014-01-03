define(['constants/HistoryConstant'], function (HistoryConstant) {
    function HistoryManager(history, view) {
        this.history = history;
        this.view = view;
    }

    HistoryManager.prototype.getHistoryData = function (strategy) {
        if (strategy === HistoryConstant.BY_TIME) {
            return this.history.getByTime();

        } else if (strategy === HistoryConstant.BY_OBJECT) {
            return this.history.getByField(this.view.fieldForHistory());

        } else if (strategy === HistoryConstant.BY_USER) {
            return this.history.getByUser(this.view.userForHistory())
        }

        return {};
    };

    return HistoryManager;
});