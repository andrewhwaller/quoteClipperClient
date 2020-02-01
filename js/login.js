const loginForm = document.getElementById('loginForm')

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let headers = new Headers();
    headers.set('Content-type', 'application/json');

    fetch("https://afternoon-fjord-40383.herokuapp.com/api/v1/users/login", {
        method: 'POST',
        body: JSON.stringify({ email: loginForm.email.value, password: loginForm.password.value }),
        headers: headers
    }).then((response) => {
        return response.json()
    }).then((json) => {
        console.log(json)
    }).catch(function (error) {
        console.log(error);
        alert("Error! Please try again.");
    });
});