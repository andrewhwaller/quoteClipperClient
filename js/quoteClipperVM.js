let homeVM = function() {
    self = this;
    let page = document.getElementsByTagName("body")[0];

    self.text = ko.observable("");
    self.userImage = ko.observable();

    self.userImage.subscribe(function(){
        self.processImage();
    })

    self.processImage = async function() {
        await page.classList.add("spinner");
        await Tesseract.recognize(
            'image_2.jpg',
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            self.text(text)
            page.classList.remove("spinner");
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
