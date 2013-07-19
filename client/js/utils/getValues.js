define(function () {
    return function getValues(constant) {
        var values = [];
        Object.getOwnPropertyNames(constant).forEach(function (key) {
            values.push(constant[key]);
        });

        return values;
    };
});