let homeVM = function () {
    self = this;

    self.text = ko.observable("");
    self.textUploaded = ko.observable(false);
    self.confidence = ko.observable("");
    self.userImage = ko.observable();
    self.tesseractStatus = ko.observable("");
    self.tesseractProgress = ko.observable("");
    self.fileTypeOutput = ko.observable("")
    self.quotes = ko.observableArray([])

    self.userImage.subscribe(function () {
        if (self.userImage()) {
            self.processImage(self.userImage());
        }
    })

    self.processImage = function (uploadedImage) {
        // self.handleFileFormat(uploadedImage)
        self.spinUp();
        Tesseract.recognize(
            uploadedImage,
            'eng',
            { 
                logger: m => {
                    self.tesseractStatus(m.status);
                    self.setProgress(m.progress);
                } 
            }
          ).then(({ data }) => {
            self.text(data.text)
            self.confidence(data.confidence)
            console.log(data)
            spinnerContainer.style.display = "none";
            $('[data-toggle="tooltip"]').tooltip();
          })
    }

    // self.handleFileFormat = (uploadedImage) => {
    //     let codename = uploadedImage.name;
    //     console.log(uploadedImage.type)
    //     if (uploadedImage.type === "image/heic") {
            
    //     } else {
    //         return
    //     }
    // }

    self.spinUp = () => {
        self.text("");
        let spinnerContainer = document.getElementById("spinnerContainer");
        let welcomeMessage = document.getElementById("welcomeMessage");
        if (welcomeMessage) {
            welcomeMessage.style.display = "none";
        }
        spinnerContainer.style.display = "flex";
    }

    self.grabText = () => {
        let textarea = document.getElementById("editor");
        textarea.select();
        document.execCommand("copy");
        document.getSelection().removeAllRanges();
    }

    self.setProgress = (progressValue) => {
        let updatedValue = (progressValue * 100)
        self.tesseractProgress(updatedValue);
    }

    self.reset = () => {
        self.text("");
        self.userImage("");
        let welcomeMessage = document.getElementById("welcomeMessage");
        welcomeMessage.style.display = "block";
    }
}

class Quote {
    constructor(data) {
        this.name = data.attributes.name;
        this.text = data.attributes.text;
        this.sourceTitle = data.attributes.source_title;
        this.sourceAuthor = data.attributes.source_author;
        this.sourcePageNumber = data.attributes.source_page_number;
        this.sourcePublisher = data.attributes.source_publisher;
        this.sourcePublicationYear = data.attributes.source_publication_year;
        this.userId = data.relationships.user.data.id;
    }

    displayInfo() {
        console.log(this.name(), this.text(), this.sourceTitle())
    }
};

let vm = new homeVM();

let fileInput = document.getElementById('customFile');

fileInput.addEventListener('change', function(event) {
    if(event.target.files) {
        let file = event.target.files[0];
        var reader  = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (event) {
            return new Promise((res, rej)=>{
                var image = new Image();
                image.src = event.target.result;
                res(image);
            }).then((image)=>{
                console.log(image)
                var canvas = document.getElementById('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image,0,0);
                var convertedImage = canvas.toDataURL('image/jpeg', 1.0);
                vm.userImage(convertedImage);
                console.log(vm.userImage())
            })
        }
    }
});

let loadDependencies = async () => {
    await bind();
    await console.log("binding is done")
    getQuotes();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
    console.log("bind happened")
}

loadDependencies();

let baseUrl = "https://afternoon-fjord-40383.herokuapp.com/api/v1";

let getQuotes = () => {
    fetch(baseUrl + "/quotes")
        .then((response) => response.json())
        .then((json) => {
            json.data.forEach(element => {
                let loadedQuote = new Quote(element);
                vm.quotes().push(loadedQuote)
            });
            console.log(vm.quotes())
        })
}
