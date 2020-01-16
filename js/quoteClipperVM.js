let homeVM = function () {
    self = this;

    self.text = ko.observable("");
    self.userImage = ko.observable();
    self.tesseractStatus = ko.observable("");
    self.tesseractProgress = ko.observable("");

    self.userImage.subscribe(function () {
        if (self.userImage()) {
            const selectedFile = document.getElementById('customFile').files[0];
            self.processImage(selectedFile);
        }
    })

    self.processImage = function (uploadedImage) {
        let spinnerContainer = document.getElementById("spinnerContainer");
        let welcomeMessage = document.getElementById("welcomeMessage");
        welcomeMessage.style.display = "none";
        spinnerContainer.style.display = "flex";
        Tesseract.recognize(
            uploadedImage,
            'eng',
            { 
                logger: m => {
                    self.tesseractStatus(m.status);
                    self.setProgress(m.progress);
                } 
            }
          ).then(({ data: { text } }) => {
            self.text(text)
            spinnerContainer.style.display = "none";
          })
    }

    self.grabText = () => {
        let textarea = document.getElementById("textCanvas");
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

let vm = new homeVM();

let loadDependencies = async () => {
    await bind();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
}

loadDependencies();