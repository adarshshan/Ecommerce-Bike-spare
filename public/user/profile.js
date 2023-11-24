// Alert Popup
function openPopup() {
    popup.classList.add('open-popup');
}
function closePopup() {
    popup.classList.remove('open-popup');
}


async function addressBook() {
    try {
        let x = '';
        const space = document.getElementById('passForm')
        const response = await fetch(`/address`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            for (let i = 0; i < resBody.addressBook[0].address.length; i++) {
                x += `
                <div class="row wallet-card shadow m-2 bg-light" id="addr${resBody.addressBook[0].address[i]._id}">
                        <p class="fs-3 fw-bold">${resBody.addressBook[0].address[i].name}</p>
                        <div class="col-md-4 col-12 col-lg-4">
                            <p>Full address : ${resBody.addressBook[0].address[i].fullAddress}</p>
                            <p>Mobile Number : ${resBody.addressBook[0].address[i].phone}</p>
                            <p>Pin code : ${resBody.addressBook[0].address[i].pinCode}:</p>
                        </div>
                        <div class="col-md-8 col-12 col-lg-8">
                            <button onclick="addressDelete('${resBody.addressBook[0].address[i]._id}')" class="border-0"><i class="fa fa-trash mr-1 text-danger"></i>Remove</button>
                            <p>District: ${resBody.addressBook[0].address[i].district}</p>
                            <p>Landmark: ${resBody.addressBook[0].address[i].landmark}</p>
                            <p>Alternative Number: ${resBody.addressBook[0].address[i].alternativePhone}</p>
                            
                        </div>
                    </div>`
            }
            space.innerHTML = x
        }
    } catch (error) {
        console.log(error)
    }
}
async function addressDelete(id) {
    let x = ''
    const response = await fetch(`/users/delete_address/${id}`, { method: "get" })
    const resBody = await response.json()
    if (resBody.addressList) {
        for (let i = 0; i < resBody.addressList.address.length; i++) {
            x += `
                <div class="row shadow m-2 bg-light" id="addr${resBody.addressList.address[i]._id}">
                        <p class="fs-3 fw-bold">${resBody.addressList.address[i].name}</p>
                        <div class="col-md-4 col-12 col-lg-4">
                            <p>Full address : ${resBody.addressList.address[i].fullAddress}</p>
                            <p>Mobile Number : ${resBody.addressList.address[i].phone}</p>
                            <p>Pin code : ${resBody.addressList.address[i].pinCode}:</p>
                        </div>
                        <div class="col-md-8 col-12 col-lg-8">
                            <button class="border-0" onclick="addressDelete('${resBody.addressList.address[i]._id}')"><i class="fa fa-trash mr-1 text-danger"></i>Remove</button>
                            <p>District: ${resBody.addressList.address[i].district}</p>
                            <p>Landmark: ${resBody.addressList.address[i].landmark}</p>
                            <p>Alternative Number: ${resBody.addressList.address[i].alternativePhone}</p>
                            
                        </div>
                    </div>`
        }
        const space = document.getElementById('passForm').innerHTML = x;
    }
}


function editAddress(data) {
    const addressData = JSON.parse(data);
    document.getElementById(`addr${addressData.id}`).innerHTML = `
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
                                    <span id="phone-error"></span>
                            </div>
                        </div>
                        <div class="col-sm-12  col-12 mb-3">
                            <p class="mb-0">Address</p>
                            <div class="form-outline">
                                <input type="number" id="address" value="${addressData.fullAddress}" placeholder="Type here"
                                    class="form-control p-3" onkeyup="validateAddress()" />
                                    <span id="address-error"></span>
                            </div>
                        </div>

                        <div class="col-sm-6 col-12 mb-3">
                            <p class="mb-0">Pin code</p>
                            <div class="form-outline">
                                <input type="number" id="pin" value="${addressData.pinCode}" placeholder="Type here"
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
                                <input type="text" id="Landmark" value="${addressData.landmark}" class="form-control p-3" onkeyup="validateLandmark()" />
                                <span id="landmark-error"></span>
                            </div>
                        </div>

                        <div class="col-sm-6 col-12 mb-3">
                            <p class="mb-0">Alternative mobile number</p>
                            <div class="form-outline">
                                <input type="number" id="alternumber" value="${addressData.alterPhone}" class="form-control p-3" onkeyup="validateAlternumber()" />
                                <span id="alternumber-error"></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 form-group float-end pt-3">
                <button onclick="return addNewAddress()" class="btn btn-primary px-3 float-end"><i
                        class="fa fa-address-card mr-1"></i> Add new Address</button>
            </div>`
}

async function changePasswordForm() {
    document.getElementById('passForm1').style.display = 'block'
    console.log('Entered into changepassword form')
    document.getElementById('passForm').style.display = 'none'
    document.getElementById('passForm1').innerHTML = `
                    <div class="row">
                        <div class="col-12">
                            <div class="col-12">
                                <h2>Change Password </h2>
                            </div>
                                <div class="form-outline mb-4">
                                    <input name="oldpassword" type="password" id="oldpassword"
                                        class="form-control"/>
                                    <label class="form-label">Old Password</label>
                                </div>

                                <div class="form-outline mb-4">
                                    <input name="newpassword" type="password" id="newpassword"
                                        class="form-control"/>
                                    <label class="form-label">New Password</label>
                                </div>

                                <div class="pt-1 mb-4">
                                    <button onclick="updatePass()" class="btn btn-dark btn-lg btn-block">Submit</button>
                                </div>
                        </div>
                    </div>`
}
async function updatePass() {
    console.log('Entered into updatepass function')
    try {
        const oldpassword = document.getElementById('oldpassword').value
        const newpassword = document.getElementById('newpassword').value
        console.log(`1 :${oldpassword}  2:${newpassword}`)
        const response = await fetch(`/changePassword/${oldpassword}/${newpassword}`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            console.log('Success part')
            console.log(resBody.message)
            document.getElementById('passForm1').style.display = 'none'
            document.getElementById('passForm').style.display = 'block'
            openPopup();
        } else {
            console.log('somthing went wrong')
            console.log(resBody.message)
            document.getElementById('message').innerHTML = `
                            <div class="alert alert-dismissible fade show alert-warning" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                            </div>
            `
        }
    } catch (error) {
        console.log(error)
    }
}
async function editEmail(data) {
    const emailData = JSON.parse(data)
    console.log(`Your new Email is ${emailData.email}`)
    document.getElementById('emailData').innerHTML = `
                                <div class="col-sm-9 mb-3 col-12" id="verify">
                                    <p class="mb-0">Name</p>
                                    <div class="form-outline">
                                        <input type="text" id="email" value="${emailData.email}" placeholder="Type here"
                                            class="form-control p-3" />
                                    </div>
                                    <button onclick="updateEmail()" class="btn btn-primary px-3 float-end border-0"><i
                                    class="fa fa-address-card mr-1"></i> save changes</button>
                                </div>`
}
async function updateEmail() {
    try {
        const email = document.getElementById('email').value
        console.log(`Your new Email is ${email}`)
        const response = await fetch(`/changeEmail/${email}`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            console.log(resBody.message)
            document.getElementById('emailData').innerHTML = `
            <a href="/verifyOtp">
                <div class="col-md-12 btn btn-primary">
                <h5>Verify Otp</h5>
                </div>
            </a>`
        } else {
            console.log(resBody.message)
            document.getElementById('message').innerHTML = `
                        <div class="alert alert-dismissible fade show alert-warning" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                        </div>`
        }
    } catch (error) {
        console.log(error)
        console.log(resBody.message)
    }
}
async function editPhone(data) {
    const phoneData = JSON.parse(data)
    console.log(`Your new phone number is ${phoneData.phone}`)
    document.getElementById('phoneData').innerHTML = `
                                <div class="col-sm-9 mb-3 col-12">
                                    <p class="mb-0">Name</p>
                                    <div class="form-outline">
                                        <input type="text" id="phone" value="${phoneData.phone}" placeholder="Type here"
                                            class="form-control p-3" />
                                    </div>
                                    <button onclick="updatePhone()" class="btn btn-primary px-3 float-end border-0"><i
                                    class="fa fa-address-card mr-1"></i> save changes</button>
                                </div>`
}
async function updatePhone() {
    try {
        const phone = document.getElementById('phone').value
        console.log(`Your new phoneNumber is ${phone}`)
        const response = await fetch(`/changePhone/${phone}`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            document.getElementById('message-alert').innerHTML = 'Mobile number updated successfully.'
            openPopup()
            document.getElementById('phoneData').innerHTML = `
            <div class="col-sm-3">
                            <p class="mb-0 fs-5"><strong>Mobile Number</strong></p>
                        </div>
                        <div class="col-sm-6">

                            <p class="mb-0">
                                ${phone}
                            </p>

                        </div>
                        <div class="col-sm-3">
                            <button class="border-0 bg-light" onclick="editPhone('<%= JSON.stringify({phone:user.phone}) %>')"><i class="fa-regular fa-pen-to-square text-primary"></i>EDIT</button>
                        </div> `
            document.getElementById('message').innerHTML = `
                        <div class="alert alert-dismissible fade show alert-success" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                        </div>`
            document.getElementById('customer-phone').innerHTML = phone
        } else {
            console.log(resBody.message)
            document.getElementById('message').innerHTML = `
                        <div class="alert alert-dismissible fade show alert-warning" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                        </div>`
            document.getElementById('phoneData').innerHTML = `
                    <div class="col-sm-3">
                            <p class="mb-0 fs-5">Mobile</p>
                        </div>
                        <div class="col-sm-6">

                            <p class="text-muted mb-0">
                                <%= user.phone %>
                            </p>

                        </div>
                        <div class="col-sm-3">
                            <button class="border-0 bg-light" onclick="editPhone('<%= JSON.stringify({phone:user.phone}) %>')"><i class="fa-regular fa-pen-to-square text-primary"></i>EDIT</button>
                    </div>`
        }
    } catch (error) {
        console.log(error)
        console.log(resBody.message)
    }
}
async function editNameForm(data) {
    const nameData = JSON.parse(data);
    console.log(`Name is ${nameData.name}`)
    document.getElementById('nameData').innerHTML = `
                                <div class="col-sm-9 mb-3 col-12">
                                        <p class="mb-0">Name</p>
                                    <div class="form-outline">
                                        <input type="text" id="name" value="${nameData.name}" placeholder="Type here"
                                            class="form-control p-3" />
                                    </div>
                                    <button onclick="updateName()" class="btn btn-primary px-3 float-end"><i
                                class="fa fa-address-card mr-1"></i> Update address</button>
                                </div>`

}
async function updateName() {
    const name = document.getElementById('name').value
    console.log(`Your namve is ${name}`)
    const response = await fetch(`/changeName/${name}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        document.getElementById('message-alert').innerHTML = 'Name updated successfully.'
        openPopup()
        document.getElementById('message').innerHTML = `
                        <div class="alert alert-dismissible fade show alert-success" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                        </div>`
        document.getElementById('nameData').innerHTML = `
                        <div class="col-sm-3">
                            <p class="mb-0 fs-5"><strong>Full Name</strong></p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0">
                                ${name}
                            </p>
                        </div>
                        <div class="col-sm-3">
                            <button class="border-0 bg-light"
                                onclick="editNameForm('<%= JSON.stringify({name:user.name}) %>')"><i class="fa-regular fa-pen-to-square text-primary"></i>EDIT</button>
                        </div>`
        document.getElementById('customer-name').innerHTML = name
    } else {
        console.log(resBody.message)
        document.getElementById('message').innerHTML = `
                        <div class="alert alert-dismissible fade show alert-warning" role="alert">
                                <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                                <strong>${resBody.message}</strong>
                        </div>`
    }

}

async function logOut() {
    Swal.fire({
        title: "Log out?",
        text: "",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Log out!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/users/logout`, { method: 'get' }).then((response) => {
                if (!response.ok) {
                    console.log('there is an error...')
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then((resBody) => {
                if (resBody.success) {
                    Swal.fire({
                        title: "Logged out!",
                        text: "Visit again, Thank you.",
                        icon: "success"
                    });
                    location.href='/';
                }else{
                    alert(resBody.message)
                }
            })
        }
    });
}