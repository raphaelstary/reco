define(['lib/knockout'], function (ko) {
    function TextToken(id, value, isActive) {
        this.id = id;
        this.value = value != null ? ko.observable(value) : ko.observable();
        this.active = isActive != null ? ko.observable(isActive) : ko.observable(false);
    }

    return TextToken;
});