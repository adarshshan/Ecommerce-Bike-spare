let rupee = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
});
async function cancelCoupon(totalAmount) {
    const response = await fetch('/coupons/cancelCoupon', { method: 'get' })
    const resbody = await response.json()
    if (resbody.success) {
        alert(resbody.message)
        document.getElementById('cancelbtn').style.display = 'none'
        document.getElementById('applybtn').style.display = 'block'
        document.getElementById('couponCode').value = '';
        document.getElementById('coupon-error').innerHTML = '';
        document.getElementById('discount').innerText = rupee.format(0);
        document.getElementById('totalAmount').innerText = rupee.format(totalAmount);
        document.getElementById('percentCoupon').innerText = `Discount on Coupons `;
        localStorage.removeItem('CouponDetails')
    } else {
        alert(resbody.message)
    }
}
async function verifyCoupon(total) {
    const code = document.getElementById('couponCode').value;
    const response = await fetch(`/coupons/verify-coupon/${total}/${code}`, { method: 'get' })
    const resbody = await response.json()
    if (resbody.success) {
        let couponDetails = {
            couponDiscount: resbody.discountAmount,
            percentCoupon: resbody.percentCoupon,
            actualAmount: resbody.actualAmount
        }
        localStorage.setItem("CouponDetails", JSON.stringify(couponDetails))//Storing the coupon Details in the local storrage.
        document.getElementById('totalAmount').innerText = rupee.format(resbody.actualAmount);
        document.getElementById('discount').innerText = rupee.format(resbody.discountAmount);
        document.getElementById('percentCoupon').innerText = `Discount on Coupons(${resbody.percentCoupon}%)`;
        document.getElementById('message-alert').innerText = resbody.message
        // document.getElementById('coupon-error').innerText=resbody.message
        document.getElementById('coupon-error').innerHTML = `<p class="text-success">${resbody.message}</p>`
        document.getElementById('cancelbtn').style.display = 'block'
        document.getElementById('applybtn').style.display = 'none'
        openPopup()
    } else {
        document.getElementById('coupon-error').innerText = resbody.message
    }
}
const storedInfo = JSON.parse(localStorage.getItem('CouponDetails'))
if (storedInfo) {
    document.getElementById('cancelbtn').style.display = 'block'
    document.getElementById('applybtn').style.display = 'none'
    document.getElementById('discount').innerHTML = storedInfo.couponDiscount
    document.getElementById('percentCoupon').innerText = `Discount on Coupons(${storedInfo.percentCoupon}%)`;
    document.getElementById('totalAmount').innerText = storedInfo.actualAmount;
}