const loginForm = document.getElementById("loginForm")
const loginPanel = document.getElementById("loginPanel")
const createAccountForm = document.getElementById("createAccountForm")
const spinner = document.getElementById("spinner")

loginForm.addEventListener('submit', function (e) {
    if (loginForm.checkValidity()) {
        e.preventDefault();
        let status;
        let headers = new Headers();
        headers.set('Content-type', 'application/json');
        // fetch("https://afternoon-fjord-40383.herokuapp.com/api/v1/users/login", {
        fetch("http://localhost:3000/api/v1/login", {
            method: 'POST',
            body: JSON.stringify({ email: loginForm.email.value, password: loginForm.password.value }),
            headers: headers
        })
            .then(handleErrors)
            .then((response) => {
                status = response.status;
                return response.json();
            }).then((json) => {
                Cookies.set('auth_token', json.auth_token, { expires: 2 });
                if (status === 200 && Cookies.get('auth_token')) {
                    window.location = "/index.html";
                } else if (status === 500 && Cookies.get('auth_token')) {
                    Cookies.remove('auth_token');
                    window.location = "/login.html";
                }
            }).catch(function (error) {
                $('#errorMessage').append(error);
                $('#alert').addClass('show');
            });
    }
});

createAccountForm.addEventListener('submit', function (e) {
    if (createAccountForm.checkValidity()) {
        e.preventDefault();
        let status;
        let headers = new Headers();
        headers.set('Content-type', 'application/json');
        // fetch("https://afternoon-fjord-40383.herokuapp.com/api/v1/users/login", {
        fetch("http://localhost:3000/api/v1/users", {
            method: 'POST',
            body: JSON.stringify({ user: { email: createAccountForm.email.value, password: createAccountForm.newPassword.value, password_confirmation: createAccountForm.confirmPassword.value } }),
            headers: headers
        })
            .then(handleErrors)
            .then((response) => {
                status = response.status;
                return response.json();
            }).then((json) => {
                Cookies.set('auth_token', json.auth_token, { expires: 2 });
                if (status === 201) {
                    $('#errorMessage').append("User created successfully! Yay!");
                    $('#alert').addClass('show');
                }
            }).catch(function (error) {
                $('#errorMessage').append(error);
                $('#alert').addClass('show');
            });
    }
});

(function () {
    window.addEventListener('load', function() {
        var passwordInput = document.getElementById("newPassword");
        var confirmationInput = document.getElementById("confirmPassword");
        var forms = document.getElementsByClassName('needs-validation');

        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (passwordInput.value != confirmationInput.value) {
                    passwordInput.setCustomValidity('Passwords must match.')
                    confirmationInput.setCustomValidity('Passwords must match.')
                } else {
                    passwordInput.setCustomValidity('');
                    confirmationInput.setCustomValidity('');
                }
                
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

let handleErrors = function (response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}


function init() {    
    if (Cookies.get('auth_token')) {
        window.location = "/index.html"
    } else {
        spinner.style.display = "none"
        loginPanel.style.display = "flex"
    }
}

init();