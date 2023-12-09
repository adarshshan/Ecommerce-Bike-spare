const email = document.getElementById('email').value
const password = document.getElementById('password').value
const alertbox = document.getElementById('alertmessage')
const submitbtn = document.getElementById('loginButton');

async function validateEmail() {
    const email = document.getElementById('email').value
    const response = await fetch(`/users/validateEmail/${email}`, { method: 'get' })
    const resBody = await response.json()
    if (!resBody.success) {
        document.getElementById('email-error').style.color = 'red'
        document.getElementById('email-error').innerHTML = 'Email with user is not exist'
        return false;
    }
    document.getElementById('email-error').innerHTML = ''
    return true;
}

async function validateForm() {
    const alertbox = document.getElementById('alertmessage')
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    if (email.length == 0 || password.length == 0) {
        alertbox.innerHTML = `
              <div class="alert alert-dismissible fade show alert-danger" role="alert">
                 <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                     <strong>Input fields must be filled!</strong>
              </div>`
        return false;
    }
    const response = await fetch(`/users/login`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    const resBody = await response.json()
    if (resBody.success) {
        window.location = "/"
    } else {
        alertbox.innerHTML = `
              <div class="alert alert-dismissible fade show alert-danger" role="alert">
                 <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                     <strong>${resBody.message}</strong>
              </div>`
        return false;
    }
    return true;
}

async function forgotpassword() {
    try {
      const response = await fetch('/forgotPassword', { method: 'get' });
      const resBody = await response.json()
      if (resBody.success) {
        if (localStorage.getItem('otpTimerRemaining')) localStorage.removeItem('otpTimerRemaining');
        location.href = '/forgotPassword-page'
      } else {
        alert('Somthing went wrong');
      }
    } catch (error) {
      console.log(error)
    }
  }