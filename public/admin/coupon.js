const button = document.getElementById('myButton')
button.addEventListener('click', () => {
    document.getElementById('couponform').style.display = 'block'
    document.getElementById('couponlist').style.display = 'none'
    button.style.display = 'none'
})

async function Activate(id) {
    const response = await fetch(`/coupons/coupon-activate/${id}`, { method: 'get' })
    const resbody = await response.json()
    if (resbody.success) {
        console.log(resbody.message)
        document.getElementById('message-alert').innerText = resbody.message
        openPopup()
    } else {
        if (resbody.err) return location.href = '/err-internal';
        alert(resbody.message)
    }
}
async function deactivate(id) {
    try {
        const response = await fetch(`/coupons/coupon-deactivate/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            console.log(resbody.message)
            document.getElementById('message-alert').innerText = resbody.message
            openPopup()
        } else {
            if (resbody.err) return location.href = '/err-internal';
            alert(resbody.message);
        }
    } catch (error) {
        console.log(error)
        alert(error)
    }
}
async function deleteCoupon(id) {
    try {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/coupons/delete-coupon/${id}`, { method: 'delete' }).then((response) => {
                    return response.json()
                }).then((resbody) => {
                    if (resbody.success) {
                        document.getElementById('message-alert').innerText = resbody.message
                        Swal.fire({
                            title: "Deleted!",
                            text: resbody.message,
                            icon: "success"
                        });
                        setTimeout(() => {
                            location.reload()
                        }, 500);
                    } else {
                        if (resbody.err) return location.href = '/err-internal';
                        Swal.fire({
                            title: "Oops!",
                            text: resbody.message
                        });
                    }
                })

            }
        });
        // const response = await fetch(`/coupons/delete-coupon/${id}`, { method: 'delete' })
        // const resbody = await response.json()

    } catch (error) {
        alert(error)
    }
}
function validateCoupon() {
    try {
        const title = document.getElementById('title').value.trim();
        const minDiscount = document.getElementById('minDiscount').value
        const minPurchase = document.getElementById('minPurchase').value
        const maxDiscount = document.getElementById('maxDiscount').value
        const maxPurchase = document.getElementById('maxPurchase').value
        const maxusage = document.getElementById('maxusage').value
        const expireDate = document.getElementById('expireDate').value

        const titleError = document.getElementById('title-error')
        const minDiscountError = document.getElementById('minDiscount-error')
        const minPurchaseError = document.getElementById('minPurchase-error')
        const maxDiscountError = document.getElementById('maxDiscount-error')
        const maxPurchaseError = document.getElementById('maxPurchase-error')
        const maxusageError = document.getElementById('maxusage-error')
        const expireDateError = document.getElementById('expireDate-error')
        minDiscountError.innerText = ''; maxPurchaseError.innerText = ''; maxDiscountError.innerText = '';
        minPurchaseError.innerText = ''; maxusageError.innerText = ''; expireDateError.innerText = '';
        titleError.innerText = '';
        let flag = 0;

        if (!maxDiscount || !minDiscount || !maxPurchase || !minPurchase || !maxusage || !expireDate || !title) {
            flag = 1;
            if (!title) titleError.innerText = '* This Field is required!';
            if (!minDiscount) minDiscountError.innerText = '*This field is requried!';
            if (!maxPurchase) maxPurchaseError.innerText = '*This Field is required!';
            if (!maxDiscount) maxDiscountError.innerText = '*This Field is required!';
            if (!minPurchase) minPurchaseError.innerText = '*This field is required!';
            if (!maxusage) maxusageError.innerText = '*This Field is required!';
            if (!expireDate) expireDateError.innerText = '*This Field is required!';
        }

        if (maxPurchase < 0) {
            maxPurchaseError.innerText = 'Cannot be less than zero';
            flag = 1;
        }
        if (minPurchase < 0) {
            minPurchaseError.innerText = 'Cannot be less than zero';
            flag = 1;
        }
        if (minDiscount < 0) {
            minDiscountError.innerText = 'Minimum discount must not be less than zero.';
            flag = 1;
        }
        if (minDiscount > 100) {
            minDiscountError.innerText = 'Must be within 100%';
            flag = 1;
        }
        if (maxDiscount < 0) {
            maxDiscountError.innerText = 'Maximum discount must not be less than zero';
            flag = 1;
        }
        if (maxDiscount > 100) {
            maxDiscountError.innerText = 'Must be within 100%';
            flag = 1;
        }
        if (maxusage < 0) {
            maxusageError.innerText = 'value must not be less than zero.';
            flag = 1;
        }
        if (parseInt(minDiscount) > parseInt(maxDiscount)) {
            maxDiscountError.innerText = 'Maximum Discount must not be less than minimum discount!'
            flag = 1;
        }
        if (parseInt(minPurchase) > parseInt(maxPurchase)) {
            maxPurchaseError.innerText = 'Maximum purchase must not be less than minimum purchase!'
            flag = 1;
        }
        if (flag === 0) {
            return true;
        }
        return false;
    } catch (error) {
        console.log(error)
    }
}
async function addCoupon() {
    try {
        let validate = validateCoupon();
        if (!validate) return;
        const title=document.getElementById('title').value.trim();
        const minDiscount = document.getElementById('minDiscount').value
        const minPurchase = document.getElementById('minPurchase').value
        const maxDiscount = document.getElementById('maxDiscount').value
        const maxPurchase = document.getElementById('maxPurchase').value
        const maxusage = document.getElementById('maxusage').value
        const expireDate = document.getElementById('expireDate').value
        const response = await fetch(`/coupons`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title:title,
                minDiscount: minDiscount,
                minPurchase: minPurchase,
                maxDiscount: maxDiscount,
                maxPurchase: maxPurchase,
                maxusage: maxusage,
                expireDate: expireDate
            })
        })
        const resbody = await response.json()
        if (resbody.success) {
            document.getElementById('message-alert').innerText = resbody.message
            openPopup();
        } else {
            if (resbody.err) return location.href = '/err-internal';
            Swal.fire({ text: resbody.message, icon: 'warning', timer: 10000 });
            // alert(resbody.message)
        }
    } catch (error) {
        console.log(error)
        alert(error)
    }
}
function openPopup() {
    popup.classList.add('open-popup');

}
function closePopup() {
    window.location.reload()
    popup.classList.remove('open-popup');
    location.reload()
}
const errorMsg = document.getElementById('error');

function couponEditForm(data) {
    try {
        const couponData = JSON.parse(data);
        const editform = document.getElementById('couponlist')
        editform.innerHTML = `
                    <div class="card-body">
                        <h2>Edit Coupon</h2>
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" class="form-control" id="title" value="${couponData.title}" name="title" placeholder=""
                                required>
                                <span id="title-error" class="text-danger"></span>
                        </div>
                        <div class="form-group">
                            <label for="minDiscount">Discount in percentage</label>
                            <input type="number" class="form-control" id="minDiscount" value="${couponData.minDiscount}" name="minDiscount" placeholder=""
                                required>
                                <span id="minDiscount-error" class="text-danger"></span>
                        </div>
                        <div class="form-group">
                            <label for="maxDiscount">Maximum Discount in percentage(optional)</label>
                            <input type="number" class="form-control" id="maxDiscount" value="${couponData.maxDiscount}" name="maxDiscount" placeholder="" >
                            <span id="maxDiscount-error" class="text-danger"></span>
                        </div>
                        <div class="form-group">
                            <label for="minPurchase">Minimum Purchase</label>
                            <input type="number" class="form-control" id="minPurchase" value="${couponData.minPurchase}" name="minPurchase"
                                placeholder="" required>
                                <span id="minPurchase-error" class="text-danger"></span>
                        </div>
                        <div class="form-group">
                            <label for="maxPurchase">Maximum Purchase for eligible maximum discount(Optional)</label>
                            <input type="number" class="form-control" id="maxPurchase" value="${couponData.maxPurchase}" name="maxPurchase"
                                placeholder="" >
                                <span id="maxPurchase-error" class="text-danger"></span>
                        </div>
                        <div class="form-group">
                            <div class="form-group">
                            <label for="amount">Maximum usage</label>
                            <input type="number" class="form-control" id="maxusage" value="${couponData.maxusage}" name="maxusage" placeholder=""
                                required>
                                <span id="maxusage-error" class="text-danger"></span>
                             </div>
                            <div class="form-group">
                                <label for="expireDate">Expiration Date</label>
                                <input type="date" class="form-control" id="expireDate" value="${couponData.expireDate}" name="expireDate"
                                    required>
                                    <span id="expireDate-error" class="text-danger"></span>
                            </div>
                            <span id="common-error" class="text-danger"></span> <br>
                            <button type="submit" class="btn btn-primary" onclick="couponEdit('${couponData.id}')">Update changes</button>
                    </div>`
    } catch (error) {
        console.log(error)
        alert('Somthing trouble at function couponEditForm()');
    }
}

async function couponEdit(couponId) {
    try {
        const validate = validateCoupon();
        if (!validate) return 0;
        const title = document.getElementById('title').value.trim();
        const minDiscount = document.getElementById('minDiscount').value
        const minPurchase = document.getElementById('minPurchase').value
        const maxDiscount = document.getElementById('maxDiscount').value
        const maxPurchase = document.getElementById('maxPurchase').value
        const maxusage = document.getElementById('maxusage').value
        const expireDate = document.getElementById('expireDate').value
        const response = await fetch(`/coupons/edit-coupon/${couponId}/${minDiscount}/${minPurchase}/${maxDiscount}/${maxPurchase}/${expireDate}/${maxusage}/${title}`, { method: 'get' })
        const resbody = await response.json();
        if (resbody.success) {
            document.getElementById('message-alert').innerText = resbody.message
            openPopup();
        } else {
            if (resbody.err) return location.href = '/err-internal';
            alert(resbody.message)
            errorMsg.innerHTML = `
        <div class="alert alert-dismissible fade show alert-danger" role="alert">
         <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
             <strong>${resbody.message}</strong>
      </div>`
        }
    } catch (error) {
        console.log(error)
        alert('Somthing went wrong at function couponEdit()');
    }
}

function openPopup() {
    popup.classList.add('open-popup');
}
function closePopup() {
    popup.classList.remove('open-popup');
    setTimeout(() => {
        location.reload()
    }, 500)
}