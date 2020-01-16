let homeVM = function() {
    self = this;

    self.title = ko.observable("welcome to quoteClipper!");

}

let vm = new homeVM();

let loadDependencies = async () => {
    await bind();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
}

loadDependencies();