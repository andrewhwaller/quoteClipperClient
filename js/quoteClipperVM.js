let homeVM = function () {
    self = this;

    self.text = ko.observable("");
    self.userImage = ko.observable();
    self.tesseractStatus = ko.observable("");
    self.tesseractProgress = ko.observable("");
    self.fileTypeOutput = ko.observable("")

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
          ).then(({ data: { text } }) => {
            self.text(text)
            spinnerContainer.style.display = "none";
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
                var canvas = document.getElementById('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image,0,0);
                var fullQuality = canvas.toDataURL('image/png');
                vm.userImage(fullQuality);
            })
        }
      }
   });

let loadDependencies = async () => {
    await bind();
}

let bind = () => {
    ko.applyBindings(vm, $("body")[0]);
}

loadDependencies();