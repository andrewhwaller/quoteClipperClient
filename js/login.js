const loginForm = document.getElementById('loginForm')
const loginPanel = document.getElementById("loginPanel")
const spinner = document.getElementById("spinner")

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let status;
    let headers = new Headers();
    headers.set('Content-type', 'application/json');
    fetch("https://afternoon-fjord-40383.herokuapp.com/api/v1/users/login", {
        method: 'POST',
        body: JSON.stringify({ email: loginForm.email.value, password: loginForm.password.value }),
        headers: headers
    }).then((response) => {
        status = response.status;
        return response.json()
    }).then((json) => {
        Cookies.set('auth_token', json.auth_token, { expires: 2 });
        if (status === 200) {
            window.location = "/quoteClipper.html"
        }
    }).catch(function (error) {
        console.log(error);
        alert("Invalid credentials! Please try again.");
    });
});

function init() {    
    if (Cookies.get('auth_token')) {
        window.location = "/quoteClipper.html"
    } else {
        spinner.style.display = "none"
        loginPanel.style.display = "flex"
    }
}

init();