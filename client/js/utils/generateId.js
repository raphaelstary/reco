define(function () {
    /**
     * @return {string}
     */
    function string4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return function () {
        return string4() + string4() + string4() + string4();
    }
});
