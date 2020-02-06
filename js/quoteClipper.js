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
    self.selectedQuote = ko.observable();
    self.quotesDropdown = {
        searchValue: ko.observable()
    }

    self.quotesDropdown.searchValue.subscribe(function(param) {
        self.filterQuotes(param);
    });

    self.filterQuotes = function(param) {
        param = param.toLowerCase();
        self.quotes().forEach(function(quote) {
            if (
                quote.name.toLowerCase().indexOf(param) > -1
                || quote.text.toLowerCase().indexOf(param) > -1
                || quote.sourceAuthor.toLowerCase().indexOf(param) > -1
                || quote.sourceTitle.toLowerCase().indexOf(param) > -1)
            {
                quote.isFiltered(true);
            } else {
                quote.isFiltered(false);
            }
        });
    }

    self.userImage.subscribe(() => {
        if (self.userImage()) {
            self.processImage(self.userImage());
        }
    });

    self.processImage = function(uploadedImage) {
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
        let headers = new Headers();
        headers.set('Content-type', 'application/json');
        headers.set('Authorization', Cookies.get('auth_token'));
        fetch(baseUrl + "/quotes", {
            method: 'post',
            body: JSON.stringify(
                {
                    quote: {
                                name: self.quoteName(),
                                text: self.text(),
                                source_title: self.quoteSourceTitle(),
                                source_author: self.quoteSourceAuthor(),
                                source_page_number: self.quoteSourcePageNumber(),
                                source_publisher: self.quoteSourcePublisher(),
                                source_publication_year: self.quoteSourceYearPublished()
                            }
                }
            ),
            headers: headers
        })
            .then(handleErrors)
            .then((response) => {
                if (response.status == 201) {
                    displaySuccess("You clipped a new quote!")
                }
            }).catch(function (error) {
                displayError(error)
            });
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
            this.createDate = dayjs(data.attributes.created_at).format('dddd, DD/MM/YYYY h:mm A');
            this.isFiltered = ko.observable(true)
        } else if (!data) {
            this.name = vm.quoteName()
            this.text = vm.text()
            this.sourceTitle = vm.quoteSourceTitle()
        }
    }

    display() {
        vm.selectedQuote(this)
        $("#editQuoteModal").modal("show")
    }

    save() {
        let updatedQuote = this.toJson();
        let headers = new Headers();
        headers.set('Content-type', 'application/json');
        headers.set('Authorization', Cookies.get('auth_token'));
        fetch(baseUrl + "/quotes/" + this.id, {
            method: 'put',
            body: JSON.stringify(updatedQuote),
            headers: headers
        })
            .then(handleErrors)
            .then((response) => {
                status = response.status;
                return response.json();
            }).then((json) => {
                displaySuccess("Quote updated successfully!")
                getQuotes();
            }).catch(function (error) {
                displayError(error)
            });
    }

    delete() {
        let headers = new Headers();
        headers.set('Content-type', 'application/json');
        headers.set('Authorization', Cookies.get('auth_token'));

        fetch(baseUrl + "/quotes/" + this.id, {
            method: 'delete',
            body: JSON.stringify(this),
            headers: headers
        })
            .then(handleErrors)
            .then((response) => {
                if (response.status == 204) {
                    displaySuccess("Quote deleted!");
                    getQuotes();
                }
            }).catch(function (error) {
                displayError(error)
            });
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

var vm = new pageVM();

document.getElementById("signOut").addEventListener('click', function () {
    Cookies.remove('auth_token')
    window.location = "/login.html"
})

var fileInput = document.getElementById("customFile");

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

var baseUrl = "https://afternoon-fjord-40383.herokuapp.com/api/v1";
// var baseUrl = "http://localhost:3000/api/v1"

let getQuotes = function() {
    fetch(baseUrl + "/quotes", {
        headers: {
            'Authorization': Cookies.get('auth_token')
        }
    }).then(handleErrors)
        .then(response => response.json())
        .then(async function(json) {
            if (json.data) {
                var queriedQuotes = await []
                await json.data.forEach(element => {
                    let loadedQuote = new QuoteVM(element);
                    queriedQuotes.push(loadedQuote);
                });
                vm.quotes(queriedQuotes)
            }

        })
        .catch(function (error) {
            displayError(error)
            // Cookies.remove('auth_token')
            // window.location = "/login.html"
        });
};

let handleErrors = function (response) {
    if (response.status === 403) {
        Cookies.remove('auth_token')
        window.location = "/login.html"
    } else if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

let displayError = function (message) {
    $('.modal').modal('hide');
    $('#errorMessage').append(message);
    $('#errorAlert').removeClass('d-none');
    $('#errorAlert').addClass('show');
    
    setTimeout(function() {
        $(".alert").alert('close');
    }, 3000);  
}

let displaySuccess = function (message) {
    $('.modal').modal('hide');
    $('#successMessage').append(message);
    $('#successAlert').removeClass('d-none');
    $('#successAlert').addClass('show');

    setTimeout(function() {
        $(".alert").alert('close');
    }, 3000);
}

let checkToken = function () {
    let token = Cookies.get('auth_token')
    if (!token) {
        window.location = "/login.html"
    }
}

let loadDependencies = async function () {
    await bind();
    getQuotes();
};

let bind = function() {
    ko.applyBindings(vm, $("body")[0]);
};


let init = async function () {
    await checkToken();
    await loadDependencies();
}

init();