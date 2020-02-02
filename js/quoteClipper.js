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

    // self.handleFileFormat = (uploadedImage) => {
    //     let codename = uploadedImage.name;
    //     console.log(uploadedImage.type)
    //     if (uploadedImage.type === "image/heic") {

    //     } else {
    //         return
    //     }
    // }

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
        let object = {
            name: this.name,
            text: this.text,
            source_title: this.sourceTitle,
            source_author: this.sourceAuthor,
            source_page_number: this.sourcePageNumber,
            source_publisher: this.sourcePublisher,
            source_publication_year: this.sourcePublicationYear
        }
        console.log(object)
        return object;
    }

    save() {

    }
}

// class ProjectVM {
//     constructor(data) {
//         if (!data) {
//             data = {
//                 urn: loki.app.rootUrn + ":data:projects:$"
//             };
//         }
//         this.urn = ko.observable(data.urn);
//         var isNew = loki.urn.isNew(data.urn);
//         var codeName = "";
//         if (!isNew) {
//             codeName = ko.observable(loki.urn.getLastSegment(data.urn));
//         }
//         this.codeName = ko.observable(codeName);
//         this.codeNameActive = ko.observable(isNew);
//         this.codeNameBehavior = new lokiUrnCodeNameBehavior({
//             container: "#projectEditModal",
//             nameNode: "#nameInput",
//             codeNameNode: "#codeNameInput",
//             urnObservable: this.urn,
//             codeNameObservable: this.codeName
//         });
//         this.codeNameActive.subscribe(function(cn) {
//             behave.inactive = !cn;
//         });
//         this.name = data.name;
//         this.summary = data.summary;
//     }
//     codeNameEntry() {
//         this.codeNameBehavior.inactive = true;
//     }
//     toJSON() {
//         return {
//             urn: this.urn(),
//             name: this.name
//         };
//     }
//     save() {
//         var data = this.toJSON();
//         return new Promise((resolve, reject) => {
//             loki.data.saveEntity(data.urn, "urn:com:saplingdata:projects:model:types:project", data)
//             .done(function(data) {
//                 resolve(data);
//             })
//             .fail(function(err) {
//                 reject(err);
//             });
//         });
//     }
//     delete() {
//         var urn = this.urn();
//         return new Promise((resolve, reject) => {
//             loki.data.deleteEntity(urn)
//             .done(function(data) {
//                 resolve(data);
//             })
//             .fail(function(err) {
//                 reject(err);
//             });
//         });
//     }
//     static loadProject(urn) {
//         return new Promise((resolve, reject) => {
//             loki.data.loadEntity(urn, "urn:com:saplingdata:projects:model:types:project")
//             .done(function(data) {
//                 var p = new ProjectVM(data);
//                 resolve(p);
//             })
//             .fail(function(err) {
//                 reject(err);
//             });
//         });
//     }
// }

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

let loadDependencies = async function() {
    await bind();
    getQuotes();
    newQuoteFromVM();
};

let bind = function() {
    ko.applyBindings(vm, $("body")[0]);
};

loadDependencies();

let baseUrl = "https://afternoon-fjord-40383.herokuapp.com/api/v1";

let getQuotes = function() {
    fetch(baseUrl + "/quotes", {
        headers: {
            'Authorization': Cookies.get('auth_token')
        }
    })
        .then(response => response.json())
        .then(json => {
            json.data.forEach(element => {
                console.log(element)
                let loadedQuote = new QuoteVM(element);
                vm.quotes().push(loadedQuote);
            });
        });
        console.log(vm.quotes())
};

let newQuoteFromVM = function() {
    let newQuote = new QuoteVM();
    console.log(newQuote)
}
