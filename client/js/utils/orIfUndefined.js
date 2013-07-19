define(function () {
    return function orIfUndefined(that) {
        if (this !== undefined) {
            return this;
        }
        return that;
    };
});