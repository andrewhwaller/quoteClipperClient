let loginVM = function () {
    self = this;

    self.email = ko.observable(null);
    self.password = ko.observable(null);
    self.passwordConfirm = ko.observable(null);
    self.passwordMatch = ko.observable();

}

let vm = new loginVM();

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
    console.log("bind happened")
}

bind();