define(function () {
    return function getUrlParams(url) {
        var urlParams = {};
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
            urlParams[key] = value;
        });
        return urlParams;
    }
});