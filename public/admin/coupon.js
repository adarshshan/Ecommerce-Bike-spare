async function Activate(id) {
    const response = await fetch(`/coupons/coupon-activate/${id}`, { method: 'get' })
    const resbody = await response.json()
    if (resbody.success) {
        console.log(resbody.message)
        document.getElementById('message-alert').innerText = resbody.message
        openPopup()
    } else {
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
            alert(resbody.message);
        }
    } catch (error) {
        console.log(error)
        alert(error)
    }
}
async function deleteCoupon(id) {
    try {
        const response = await fetch(`/coupons/delete-coupon/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            document.getElementById('message-alert').innerText = resbody.message
            openPopup();
        } else {
            alert(resbody.message)
        }
    } catch (error) {
        alert(error)
    }
}
async function addCoupon() {
    try {
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
            alert('failed to add coupon...');
            alert(resbody.message)
        }
    } catch (error) {
        console.log(error)
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
                            <label for="minDiscount">Discount in percentage</label>
                            <input type="number" class="form-control" id="minDiscount" value="${couponData.minDiscount}" name="minDiscount" placeholder=""
                                required>
                        </div>
                        <div class="form-group">
                            <label for="maxDiscount">Maximum Discount in percentage(optional)</label>
                            <input type="number" class="form-control" id="maxDiscount" value="${couponData.maxDiscount}" name="maxDiscount" placeholder="" >
                        </div>
                        <div class="form-group">
                            <label for="minPurchase">Minimum Purchase</label>
                            <input type="number" class="form-control" id="minPurchase" value="${couponData.minPurchase}" name="minPurchase"
                                placeholder="" required>
                        </div>
                        <div class="form-group">
                            <label for="maxPurchase">Maximum Purchase for eligible maximum discount(Optional)</label>
                            <input type="number" class="form-control" id="maxPurchase" value="${couponData.maxPurchase}" name="maxPurchase"
                                placeholder="" >
                        </div>
                        <div class="form-group">
                            <div class="form-group">
                            <label for="amount">Maximum usage</label>
                            <input type="number" class="form-control" id="maxusage" value="${couponData.maxusage}" name="maxusage" placeholder=""
                                required>
                             </div>
                            <div class="form-group">
                                <label for="expireDate">Expiration Date</label>
                                <input type="date" class="form-control" id="expireDate" value="${couponData.expireDate}" name="expireDate"
                                    required>
                            </div>
                            <button type="submit" class="btn btn-primary" onclick="couponEdit('${couponData.id}')">Update changes</button>
                    </div>`
    } catch (error) {
        console.log(error)
        alert('Somthing trouble at function couponEditForm()');
    }
}

async function couponEdit(couponId) {
    try {
        const minDiscount = document.getElementById('minDiscount').value
        const minPurchase = document.getElementById('minPurchase').value
        const maxDiscount = document.getElementById('maxDiscount').value
        const maxPurchase = document.getElementById('maxPurchase').value
        const maxusage = document.getElementById('maxusage').value
        const expireDate = document.getElementById('expireDate').value
        const response = await fetch(`/coupons/edit-coupon/${couponId}/${minDiscount}/${minPurchase}/${maxDiscount}/${maxPurchase}/${expireDate}/${maxusage}`, { method: 'get' })
        const resbody = await response.json();
        if (resbody.success) {
            document.getElementById('message-alert').innerText = resbody.message
            openPopup();
        } else {
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
const button = document.getElementById('myButton')
button.addEventListener('click', function () {
    if (button.innerHTML === '<i class="fa-solid fa-plus fs-2"></i>') {
        button.innerHTML = '<i class="fa-solid fa-minus fs-2"></i>';
        document.getElementById('couponform').style.display = 'block'
        document.getElementById('couponlist').style.display = 'none'
    } else {
        button.innerHTML = '<i class="fa-solid fa-plus fs-2"></i>';
        document.getElementById('couponform').style.display = 'none'
        document.getElementById('couponlist').style.display = 'block'
    }
});

function openPopup() {
    popup.classList.add('open-popup');
}
function closePopup() {
    popup.classList.remove('open-popup');
    setTimeout(() => {
        location.reload()
    }, 500)
}