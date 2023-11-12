const nameError = document.getElementById('name-error')
const emailError = document.getElementById('email-error')
const phoneError = document.getElementById('phone-error')
let passwordError = document.getElementById('password-error')
const cpasswordError = document.getElementById('cpassword-error')
const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function validateCpassword(){
  try {
    let password = document.getElementById('password').value
    let cpassword=document.getElementById('cpassword').value
    if(cpassword.length==0){
      cpasswordError.style.color='red'
      cpasswordError.innerHTML='This field is required!'
      return false;
    }else if(cpassword !==password){
      cpasswordError.style.color='red'
      cpasswordError.innerHTML='passwords must be same'
      return false
    }
    cpasswordError.style.color='green'
    cpasswordError.innerHTML='valid'
    return true
    
  } catch (error) {
    console.log(error)
    console.log('Error is at ValidateCpassword')
  }
}
function validatePassword() {
  let password = document.getElementById('password').value
  if (password.length == 0) {
    document.getElementById('password-error').style.color = 'red'
    passwordError.innerHTML = 'password field must not be blank!'
    return false
  } else if (password.length < 8 || password.length > 20) {
    document.getElementById('password-error').style.color = 'red'
    passwordError.innerHTML = 'password must be atlest 8 charachers'
    return false
  }
  document.getElementById('password-error').style.color = 'green'
  passwordError.innerHTML = 'valid'

}
async function validatePhone() {
  try {
    let phone = document.getElementById('phone').value
    console.log('your phone is ' + phone.length)
    if (phone.length == 0) {
      document.getElementById('phone-error').style.color = 'red';
      phoneError.innerHTML = 'Phone Number is required !';
      return false;
    } else if (phone.length !== 10) {
      document.getElementById('phone-error').style.color = 'red';
      phoneError.innerHTML = 'phone number must be 10 numbers !';
    } else {
      document.getElementById('phone-error').style.color = 'green';
      phoneError.innerHTML = 'valid <i class="fa-solid fa-check"></i>';
    }


  } catch (error) {
    console.log(error)
    console.log('Error is at validatePhone')
  }
}
async function validateEmail() {
  try {
    var email = document.getElementById('email').value
    const response = await fetch(`/users/validateEmail/${email}`, { method: 'get' })
    const resBody = await response.json()
    if (email.length==0) {
      document.getElementById('email-error').style.color = 'red';
      emailError.innerHTML = 'Email is required'
      return false
    } else if (!pattern.test(email)) {
      document.getElementById('email-error').style.color = 'red';
      emailError.innerHTML = 'Email is invalid'
      return false
    } else if (resBody && resBody !== null) {
      document.getElementById('email-error').style.color = 'red';
      emailError.innerHTML = resBody.message
      return false
    }
    document.getElementById('email-error').style.color = 'red';
    emailError.innerHTML = resBody.message
    return true
  } catch (error) {
    console.log(error)
    console.log('Error is at catch')
  }
}
function validateName() {
  var name = document.getElementById('name').value;
  if (name.length == 0) {
    document.getElementById('name-error').style.color = 'red';
    nameError.innerHTML = 'Name is required ! ';
    return false;
  }
  if (!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)) {
    document.getElementById('name-error').style.color = 'red';
    nameError.innerHTML = 'Write full name';
    return false;
  }
  if (name.length < 9) {
    document.getElementById('name-error').style.color = 'red';
    nameError.innerHTML = 'Name must be at least 8 characters';
    return false;
  }
  document.getElementById('name-error').style.color = 'green';
  nameError.innerHTML = 'valid <i class="fa-solid fa-check"></i>';

  return true;

}

function validateForm() {
  // Get the form elements by their IDs
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var password = document.getElementById("password").value;
  var cpassword = document.getElementById("cpassword").value;

  // Basic validation (you can add more specific checks)
  if (name === "" || email === "" || phone === "" || password === "" || cpassword === "") {
    document.getElementById('submessage').innerHTML = `
                  <div class="alert alert-dismissible fade show alert-danger" role="alert">
                    <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                    <strong>
                      All fields must be filled out
                    </strong>
                  </div>`
    return false; // Prevent form submission
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || ! /[!@#$%^&*]/.test(password)) {
    document.getElementById('submessage').innerHTML = `
                  <div class="alert alert-dismissible fade show alert-danger" role="alert">
                    <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                    <strong>
                      password is weak. please make a strong password.
                    </strong>
                  </div>`
    return false;
  }

  // You can add more specific validation checks here (e.g., email format, password strength, etc.)

  // If all checks pass, allow the form submission
  return true;
}