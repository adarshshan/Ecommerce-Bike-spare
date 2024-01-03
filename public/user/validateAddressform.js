function formValidate() {
    const name = document.getElementById('name').value
    const phone = document.getElementById('phone').value
    const alterPhone = document.getElementById('alternumber').value
    const Landmark = document.getElementById('Landmark').value
    const pin = document.getElementById('pin').value
    const district = document.getElementById('district').value
    const address = document.getElementById('address').value
    if (!name.length || !phone.length || !alterPhone.length || !Landmark.length || !pin.length || !address.length || !district.length) {
        document.getElementById('alertmessage').innerHTML = `
        <div class="alert alert-dismissible fade show alert-danger" role="alert">
         <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
             <strong>Input fields must be filled!</strong>
      </div>`
        return false;
    }
    return true;
}
function validateAlternumber() {
    const phone = document.getElementById('alternumber').value
    const phoneError = document.getElementById('alternumber-error')
    if (!phone.length) {
        phoneError.style.color = 'red'
        phoneError.innerHTML = 'This field is required*'
        return false;
    } else if (phone.length !== 10) {
        phoneError.style.color = 'red'
        phoneError.innerHTML = 'Phone number should be 10 numbers'
        return false;
    }
    phoneError.innerHTML = ''
    return true;
}
function validateLandmark() {
    const Landmark = document.getElementById('Landmark').value
    const LandmarkError = document.getElementById('landmark-error')
    if (!Landmark.length) {
        LandmarkError.style.color = 'red'
        LandmarkError.innerHTML = 'This field is Required*'
        return false;
    } else if (Landmark.length < 10) {
        LandmarkError.style.color = 'red'
        LandmarkError.innerHTML = 'write altest 10 characters *'
        return false;
    }
    LandmarkError.innerHTML = ''
    return true;
}
function validatePin() {
    const pin = document.getElementById('pin').value
    const pinError = document.getElementById('pin-error')
    if (!pin.length) {
        pinError.style.color = 'red'
        pinError.innerHTML = 'This field is Required*'
        return false;
    } else if (pin.length !== 6) {
        pinError.style.color = 'red'
        pinError.innerHTML = 'pin must be 6 numbers'
        return false;
    }
    // pinError.style.color = 'green'
    pinError.innerHTML = ''
    return true;
}
function validateAddress() {
    const address = document.getElementById('address').value
    const addressError = document.getElementById('address-error')
    if (!address.length) {
        addressError.style.color = 'red'
        addressError.innerHTML = 'This field is required*'
        return false;
    } else if (address.length < 10) {
        addressError.style.color = 'red'
        addressError.innerHTML = 'must have to write atlest 10 charachers*'
        return false;
    }
    // addressError.style.color = 'green'
    addressError.innerHTML = ''
    return true;
}
function validatePhone() {
    const phone = document.getElementById('phone').value
    const phoneError = document.getElementById('phone-error')
    if (!phone.length) {
        phoneError.style.color = 'red'
        phoneError.innerHTML = 'This field is required*'
        return false;
    } else if (phone.length !== 10) {
        phoneError.style.color = 'red'
        phoneError.innerHTML = 'Phone number should be 10 numbers'
        return false;
    }
    // phoneError.style.color = 'green'
    phoneError.innerHTML = ''
}
function validateName() {
    const name = document.getElementById('name').value
    const nameError = document.getElementById('name-error')
    if (!name.length) {
        nameError.style.color = 'red'
        nameError.innerHTML = 'This field is required*'
        return false
    } else if (name.length < 4 || name.length > 20) {
        nameError.style.color = 'red'
        nameError.innerHTML = 'name must has 4-20 charachers*'
        return false
    }
    // nameError.style.color = 'green'
    nameError.innerHTML = ' '
    return true;
}