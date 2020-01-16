let homeVM = function () {
    self = this;

    self.text = ko.observable("");
    self.userImage = ko.observable();

    self.userImage.subscribe(function () {
        self.processImage();
    })

    self.processImage = async function () {
        let spinner = document.getElementsByClassName("spinner")[0];
        spinner.style.display = "inline";
        await Tesseract.recognize(
            'image_2.jpg',
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            self.text(text)
            spinner.style.display = "none";
        })
    }
}

let vm = new homeVM();

let loadDependencies = async () => {
    await bind();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
}

loadDependencies();