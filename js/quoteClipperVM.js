let homeVM = function() {
    self = this;

    self.text = ko.observable();
    self.userImage = ko.observable();

    Tesseract.recognize(
        'https://tesseract.projectnaptha.com/img/eng_bw.png',
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        self.text(text)
      })
}

let vm = new homeVM();

let loadDependencies = async () => {
    await bind();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
}

loadDependencies();