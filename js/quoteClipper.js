let pageVM = function() {
    self = this;

    self.text = ko.observable("");
    self.quoteName = ko.observable("");
    self.quoteSourceTitle = ko.observable("");
    self.quoteSourceAuthor = ko.observable("");
    self.quoteSourcePageNumber = ko.observable("");
    self.quoteSourcePublisher = ko.observable("");
    self.quoteSourceYearPublished = ko.observable("");
    self.textUploaded = ko.observable(false);
    self.confidence = ko.observable("");
    self.userImage = ko.observable();
    self.tesseractStatus = ko.observable("");
    self.tesseractProgress = ko.observable("");
    self.fileTypeOutput = ko.observable("");
    self.quotes = ko.observableArray([]);

    self.userImage.subscribe(() => {
        if (self.userImage()) {
            self.processImage(self.userImage());
        }
    });

    self.processImage = function(uploadedImage) {
        // self.handleFileFormat(uploadedImage)
        self.spinUp();
        Tesseract.recognize(uploadedImage, "eng", {
            logger: m => {
                self.tesseractStatus(m.status);
                self.setProgress(m.progress);
            }
        }).then(({ data }) => {
            self.text(data.text);
            self.confidence(data.confidence);
            console.log(data);
            spinnerContainer.style.display = "none";
            $('[data-toggle="tooltip"]').tooltip();
        });
    };

    self.spinUp = function() {
        self.text("");
        let spinnerContainer = document.getElementById("spinnerContainer");
        let welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.style.display = "none";
        }
        spinnerContainer.style.display = "flex";
    };

    self.grabText = function() {
        let textarea = document.getElementById("editor");
        textarea.select();
        document.execCommand("copy");
        document.getSelection().removeAllRanges();
    };

    self.setProgress = function(progressValue) {
        let updatedValue = progressValue * 100;
        self.tesseractProgress(updatedValue);
    };

    self.reset = function() {
        self.text("");
        self.userImage("");
        let welcomeMessage = document.getElementById("welcomeMessage");
        welcomeMessage.style.display = "block";
    };

    self.createQuote = function() {
        let quoteData = {
            name: self.quoteName(),
            text: self.text(),
            source_title: self.quoteSourceTitle(),
            source_author: self.quoteSourceAuthor(),
            source_page_number: self.quoteSourcePageNumber(),
            source_publisher: self.quoteSourcePublisher(),
            source_publication_year: self.sourcePublicationYear()
        }
    }

    self.text = ko.observable("");
    self.quoteName = ko.observable("");
    self.quoteSourceTitle = ko.observable("");
    self.quoteSourceAuthor = ko.observable("");
    self.quoteSourcePageNumber = ko.observable("");
    self.quoteSourcePublisher = ko.observable("");
    self.quoteSourceYearPublished = ko.observable("");
};

class QuoteVM {
    constructor (data) {
        if (data) {
            this.id = data.id;
            this.name = data.attributes.name;
            this.text = data.attributes.text;
            this.sourceTitle = data.attributes.source_title;
            this.sourceAuthor = data.attributes.source_author;
            this.sourcePageNumber = data.attributes.source_page_number;
            this.sourcePublisher = data.attributes.source_publisher;
            this.sourcePublicationYear = data.attributes.source_publication_year;
        } else if (!data) {
            this.name = vm.quoteName()
            this.text = vm.text()
            this.sourceTitle = vm.quoteSourceTitle()
        }
    }

    displayInfo() {
        console.log(this.name, this.text, this.sourceTitle);
    }

    toJson() {
        return {
            name: this.name,
            text: this.text,
            source_title: this.sourceTitle,
            source_author: this.sourceAuthor,
            source_page_number: this.sourcePageNumber,
            source_publisher: this.sourcePublisher,
            source_publication_year: this.sourcePublicationYear
        }
    }
}

let vm = new pageVM();

let fileInput = document.getElementById("customFile");

fileInput.addEventListener("change", function(event) {
    if (event.target.files) {
        let file = event.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(event) {
            return new Promise((res, rej) => {
                var image = new Image();
                image.src = event.target.result;
                res(image);
            }).then(image => {
                console.log(image);
                var canvas = document.getElementById("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                var convertedImage = canvas.toDataURL("image/jpeg", 1.0);
                vm.userImage(convertedImage);
                console.log(vm.userImage());
            });
        };
    }
});

let baseUrl = "https://afternoon-fjord-40383.herokuapp.com/api/v1";

let getQuotes = function() {
    fetch(baseUrl + "/quotes", {
        headers: {
            'Authorization': Cookies.get('auth_token')
        }
    })
        .then(response => response.json())
        .then(json => {
            if (json.data) {
                json.data.forEach(element => {
                    console.log(element);
                    let loadedQuote = new QuoteVM(element);
                    vm.quotes().push(loadedQuote);
                });
            }
        });
        console.log(vm.quotes())
};

let checkToken = function () {
    let token = Cookies.get('auth_token')
    if (!token) {
        window.location = "/login.html"
    }
}

let loadDependencies = async function () {
    await checkToken();
    await bind();
    getQuotes();
};

let bind = function() {
    ko.applyBindings(vm, $("body")[0]);
};

loadDependencies();
