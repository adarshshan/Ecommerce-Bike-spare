



async function addNewAddress() {
    name = document.getElementById('name').value
    phone = document.getElementById('phone').value
    address = document.getElementById('address').value
    pin = document.getElementById('pin').value
    district = document.getElementById('district').value
    landmark = document.getElementById('Landmark').value
    alterNumber = document.getElementById('alternumber').value

    addressData = {
        name: name,
        phone: phone,
        fullAddress: address,
        pinCode: pin,
        district: district,
        landmark: landmark,
        alternativePhone: alterNumber
    }
    const response = await fetch('/users/address', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
    })
    const resBody = await response.json()
    console.log(resBody.message)
    clear()
    getAddress()
    document.getElementById('form1').innerHTML = `<div class="card col-md-12 form-group d-flex p-3 btn btn-outline-primary" onclick="showform()">
                                        + Add new Address
                                    </div>`
}
async function addNewAddress() {
    name = document.getElementById('name').value
    phone = document.getElementById('phone').value
    address = document.getElementById('address').value
    pin = document.getElementById('pin').value
    district = document.getElementById('district').value
    landmark = document.getElementById('Landmark').value
    alterNumber = document.getElementById('alternumber').value

    if (!name.length || !phone.length || !address.length || !pin.length || !district.length || !landmark.length || !alterNumber.length) {
        document.getElementById('alertmessage').innerHTML = `
                <div class="alert alert-dismissible fade show alert-danger" role="alert">
                 <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                     <strong>Input fields must be filled!</strong>
              </div>`
        return false;
    }

    addressData = {
        name: name,
        phone: phone,
        fullAddress: address,
        pinCode: pin,
        district: district,
        landmark: landmark,
        alternativePhone: alterNumber
    }
    const response = await fetch('/users/address', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
    })
    const resBody = await response.json()
    console.log(resBody.message)
    clear()
    getAddress()
    document.getElementById('form1').innerHTML = `<div class="card col-md-12 form-group d-flex p-3 btn btn-outline-primary" onclick="showform()">
                                        + Add new Address
                                    </div>`
    document.getElementById('alertmessage').innerHTML = `
                                    <div class="alert alert-dismissible fade show alert-success" role="alert">
                                     <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                         <strong>Address add successfully</strong>
                                  </div>`
    return true;
}
async function updateAddress(id) {
    console.log(`the id reached at updateAddress function${id}`)
    name = document.getElementById('name').value
    phone = document.getElementById('phone').value
    address = document.getElementById('address').value
    pin = document.getElementById('pin').value
    district = document.getElementById('district').value
    landmark = document.getElementById('Landmark').value
    alterNumber = document.getElementById('alternumber').value

    if (!name.length || !phone.length || !address.length || !pin.length || !district.length || !landmark.length || !alterNumber.length) {
        document.getElementById('alertmessage').innerHTML = `
                <div class="alert alert-dismissible fade show alert-danger" role="alert">
                 <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                     <strong>Input fields must be filled!</strong>
              </div>`
        return false;
    }

    addressData = {
        name: name,
        phone: phone,
        fullAddress: address,
        pinCode: pin,
        district: district,
        landmark: landmark,
        alternativePhone: alterNumber
    }
    const response = await fetch(`/users/updateAddress/${id}`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
    })
    const resBody = await response.json()
    console.log(resBody.message)
    clear()
    getAddress()
    document.getElementById(`address${id}`).innerHTML = ``
    document.getElementById('alertmessage2').innerHTML = `
                <div class="alert alert-dismissible fade show alert-success" role="alert">
                 <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                     <strong>updated successfully</strong>
              </div>`
    return true;
}

async function getAddress() {
    const response = await fetch('/users/address_get', { method: 'get' });
    const resBody = await response.json()
    if (!resBody.addressList) {
        document.getElementById('inner').innerHTML = `<div id="inner" class="row">
        <div class="card col-md-12 form-group">
            <b>Address list is empty</b>
        </div>   
    </div>`
    } else {
        let x = ''
        for (let i = 0; i < resBody.addressList.address.length; i++) {
            x += `<div class="card col-md-12 form-group p-2" id="address${resBody.addressList.address[i]._id}">
                <div>
                    <b>${resBody.addressList.address[i].name}      ${resBody.addressList.address[i].phone}</b>
                    <p style="cursor: pointer;" class="float-end me-3 fw-bold" onclick="editAddress('${JSON.stringify({
                id: resBody.addressList.address[i]._id,
                name: resBody.addressList.address[i].name,
                phone: resBody.addressList.address[i].phone,
                fullAddress: resBody.addressList.address[i].fullAddress,
                landmark: resBody.addressList.address[i].landmark,
                pinCode: resBody.addressList.address[i].pinCode,
                alternativePhone: resBody.addressList.address[i].alternativePhone,
                district: resBody.addressList.address[i].district
            })}')">EDIT</p>


                    </div>
            
            <p class="mt-3">${resBody.addressList.address[i].fullAddress},${resBody.addressList.address[i].landmark},${resBody.addressList.address[i].pinCode},${resBody.addressList.address[i].alternativePhone},${resBody.addressList.address[i].district}</p>
            <div class="d-flex col-md-8 mb-4">
                <a href="/carts/payment_option/${resBody.addressList.address[i]._id}/${resBody.addressList.address[i].name}/${resBody.addressList.address[i].phone}">
                <botton class="btn btn-warning p-2 me-5 fw-bold">Deliver Here</botton>
            </a>
                <button onclick="addressDelete('${resBody.addressList.address[i]._id}')" class="border-0"><i class="fa fa-trash mr-1 text-danger"></i>Remove</button>
                </div>
            
        </div>`
        }
        document.getElementById('inner').innerHTML = x
    }
}

function clear() {
    console.log('clear function called...')
    document.getElementById('name').value = ''
    document.getElementById('phone').value = ''
    document.getElementById('address').value = ''
    document.getElementById('pin').value = ''
    document.getElementById('district').value = ''
    document.getElementById('Landmark').value = ''
    document.getElementById('alternumber').value = ''
}
function showform() {
    document.getElementById('form').innerHTML = `
                            <div id="alertmessage"></div>
                            <div class="row" id="form1">
                                <div class="col-sm-6 mb-3 col-12">
                                    <p class="mb-0">Name</p>
                                    <div class="form-outline">
                                        <input type="text" id="name" placeholder="Type here"
                                            class="form-control p-3" onkeyup="validateName()" />
                                            <span id="name-error">name</span>
                                    </div>
                                </div>
                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Mobile</p>
                                    <div class="form-outline">
                                        <input type="number" id="phone" placeholder="Mobile"
                                            class="form-control p-3" onkeyup="validatePhone()" />
                                            <span id="phone-error"></span>
                                    </div>
                                </div>
                                <div class="col-sm-12  col-12 mb-3">
                                    <p class="mb-0">Address</p>
                                    <div class="form-outline">
                                    <input type="text" name="address" id="address" placeholder="type here..."
                                            class="form-control p-3" onkeyup="validateAddress()" />
                                            <span id="address-error"></span>
                                    </div>
                                </div>

                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Pin code</p>
                                    <div class="form-outline">
                                        <input type="number" id="pin" placeholder="Type here"
                                            class="form-control p-3" onkeyup="validatePin()" />
                                            <span id="pin-error"></span>
                                    </div>
                                </div>

                                <div class="col-sm-6  col-12 mb-3">
                                    <p class="mb-0">District</p>
                                    <select class="form-select p-3" id="district">
                                        <option value="">Choose</option>
                                        <option value="Malappuram">Malappuram</option>
                                        <option value="Kozhikode">Kozhikode</option>
                                        <option value="Thrissur">Thrissur</option>
                                        <option value="Trivandrum">Trivandrum</option>
                                        <option value="Pathanamthitta">Pathanamthitta</option>
                                        <option value="Kasarkode">Kasarkode</option>
                                        <option value="Eranakulam">Eranakulam</option>
                                        <option value="Alappuzha">Alappuzha</option>
                                        <option value="Idukki">Idukki</option>
                                        <option value="Kannur">Kannur</option>
                                        <option value="Kollam">Kollam</option>
                                        <option value="Kottayam">Kottayam</option>
                                        <option value="Palakkad">Palakkad</option>
                                        <option value="Palakkad">Palakkad</option>
                                    </select>
                                    <span id="district-error"></span>
                                </div>



                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Landmark</p>
                                    <div class="form-outline">
                                        <input type="text" id="Landmark" class="form-control p-3" onkeyup="validateLandmark()" />
                                        <span id="landmark-error"></span>
                                    </div>
                                </div>

                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Alternative mobile number</p>
                                    <div class="form-outline">
                                        <input type="number" id="alternumber" class="form-control p-3" onkeyup="validateAlternumber()" />
                                        <span id="alternumber-error"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 form-group float-end pt-3">
                        <button onclick="return addNewAddress()" class="btn btn-primary px-3 float-end"><i
                                class="fa fa-address-card mr-1"></i> Add new Address</button>
                    </div>`
}

async function addressDelete(id) {
    try {
        console.log(`id is ${id}`)
        const response = await fetch(`/users/delete_address/${id}`, { method: "get" })
        const resBody = await response.json()
        if (resBody.addressList) {
            let x = ''
            for (let i = 0; i < resBody.addressList.address.length; i++) {
                x += `<div class="card col-md-12 form-group d-flex">
            <b>${resBody.addressList.address[i].name}      ${resBody.addressList.address[i].phone}</b>
            <p class="mt-3">${resBody.addressList.address[i].fullAddress},${resBody.addressList.address[i].landmark},${resBody.addressList.address[i].pinCode},${resBody.addressList.address[i].alternativePhone},${resBody.addressList.address[i].district}</p>
            <div class="d-flex col-md-8 mb-4">
                <botton class="btn btn-warning p-2 me-5 fw-bold" onclick="">Deliver Here</botton>
                <button onclick="addressDelete('${resBody.addressList.address[i]._id}')" class="border-0"><i class="fa fa-trash mr-1 text-danger"></i>Remove</button>
                </div>
            
        </div>`
            }
            document.getElementById('inner').innerHTML = x
            console.log('address successfully deleted...')
        } else {
            console.log('A Trouble detected while deleting the address details.')
        }
    } catch (error) {
        alert('Error occured. please check console')
        console.log(error)
    }
}
function editAddress(data) {
    const addressData = JSON.parse(data);
    console.log(`${addressData.name} phone: ${addressData.id}`)
    document.getElementById(`address${addressData.id}`).innerHTML = `
                            <div id="alertmessage"></div>
                            <div class="row" id="form1">
                                <div class="col-sm-6 mb-3 col-12">
                                    <p class="mb-0">Name</p>
                                    <div class="form-outline">
                                        <input type="text" id="name" value="${addressData.name}" placeholder="Type here"
                                            class="form-control p-3" onkeyup="validateName()" />
                                            <span id="name-error">name</span>
                                    </div>
                                </div>
                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Mobile</p>
                                    <div class="form-outline">
                                        <input type="number" id="phone" value="${addressData.phone}" placeholder="Mobile"
                                            class="form-control p-3" onkeyup="validatePhone()" />
                                            <span id="phone-error">name</span>
                                    </div>
                                </div>
                                <div class="col-sm-12  col-12 mb-3">
                                    <p class="mb-0">Address</p>
                                    <div class="form-outline">
                                    <input type="text" id="address" value="${addressData.fullAddress}" placeholder="type here..."
                                            class="form-control p-3" onkeyup="validateAddress()" />
                                            <span id="address-error">name</span>
                                    </div>
                                </div>

                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Pin code</p>
                                    <div class="form-outline">
                                        <input type="number" id="pin" value="${addressData.pinCode}" placeholder="Type here"
                                            class="form-control p-3" onkeyup="validatePin()" />
                                            <span id="pin-error">name</span>
                                    </div>
                                </div>

                                <div class="col-sm-6  col-12 mb-3">
                                    <p class="mb-0">District</p>
                                    <select class="form-select p-3" id="district" >
                                        <option value="${addressData.district}">Choose</option>
                                        <option value="Malappuram">Malappuram</option>
                                        <option value="Kozhikode">Kozhikode</option>
                                        <option value="Thrissur">Thrissur</option>
                                        <option value="Trivandrum">Trivandrum</option>
                                        <option value="Pathanamthitta">Pathanamthitta</option>
                                        <option value="Kasarkode">Kasarkode</option>
                                        <option value="Eranakulam">Eranakulam</option>
                                        <option value="Alappuzha">Alappuzha</option>
                                        <option value="Idukki">Idukki</option>
                                        <option value="Kannur">Kannur</option>
                                        <option value="Kollam">Kollam</option>
                                        <option value="Kottayam">Kottayam</option>
                                        <option value="Palakkad">Palakkad</option>
                                        <option value="Palakkad">Palakkad</option>
                                    </select>
                                </div>



                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Landmark</p>
                                    <div class="form-outline">
                                        <input type="text" id="Landmark" value="${addressData.landmark}" class="form-control p-3" onkeyup="validateLandmark()" />
                                        <span id="landmark-error">name</span>
                                    </div>
                                </div>

                                <div class="col-sm-6 col-12 mb-3">
                                    <p class="mb-0">Alternative mobile number</p>
                                    <div class="form-outline">
                                        <input type="number" id="alternumber" value="${addressData.alternativePhone}" class="form-control p-3" onkeyup="validateAlternumber()" />
                                        <span id="alternumber-error">name</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 form-group float-end pt-3">
                        <button onclick="return updateAddress('${addressData.id}')" class="btn btn-primary px-3 float-end"><i
                                class="fa fa-address-card mr-1"></i> Update address</button>
                    </div>`
}