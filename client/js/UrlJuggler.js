define(function () {
    function UrlJuggler(path, pushState) {
        this.path = path;
        this.pushState = pushState;
    }

    UrlJuggler.prototype.updateParams = function (urlParams) {
        var locationSearch = "?";
        for (var key in urlParams) {
            locationSearch = locationSearch + key + "=" + urlParams[key] + "&";
        }
        locationSearch = locationSearch.substring(0, locationSearch.length - 1);

        this.pushState({reco: "it's the shit man"}, "new params", this.path + locationSearch);
    };

    return UrlJuggler;
});