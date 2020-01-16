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
            text = text.replace(/(\r\n|\n|\r)/gm,"");
            self.text(text)
            spinner.style.display = "none";
        })
    }

    self.grabText = () => {
        let textarea = document.getElementById("textCanvas");
        textarea.select();
        document.execCommand("copy");
        document.getSelection().removeAllRanges();
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