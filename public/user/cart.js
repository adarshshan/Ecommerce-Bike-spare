let rupee = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
})
function increaseProductQuantity(productId, productPrice, actualPrice) {
    console.log(`Total price in is ${productPrice}`)
    fetch(`/carts/increaseCount/${productId}`, {
        method: 'GET'
    }).then((response) => {
        if (!response.ok) {
            console.log('there is an error...')
            throw new Error('Network response was not ok');
        }
        console.log(response)
        return response.json();
    })
        .then((data) => {
            if (data.success) {
                let total = data.productQuantity * productPrice
                let quantity = data.productQuantity
                let totalAmount = data.totalAmount
                let totalDiscount = data.totalDiscount
                let totalProducts = data.totalProducts
                let actualamount = data.productQuantity * actualPrice
                localStorage.removeItem('CouponDetails')

                const quantityInput = document.getElementById(`form${productId}`);
                if (quantityInput) {
                    quantityInput.value = quantity;
                }
                const totalPriceElement = document.getElementById(`totalproductPrice${productId}`);
                if (totalPriceElement) {
                    totalPriceElement.innerHTML = rupee.format(total.toFixed(2));
                }
                const totalDiscountElement = document.getElementById('discountamount')
                if (totalDiscountElement) {
                    totalDiscountElement.innerHTML = rupee.format(totalDiscount.toFixed(2));
                }
                const ActualPriceElement = document.getElementById(`tprice${productId}`)
                if (ActualPriceElement) {
                    ActualPriceElement.innerHTML = rupee.format(actualamount.toFixed(2));
                }
                const totalAmountElement = document.getElementById('totalAmount')
                if (totalAmountElement) {
                    totalAmountElement.innerHTML = rupee.format(totalAmount - totalDiscount.toFixed(2))
                }
                const totalProductsElement = document.getElementById('totalProducts')
                if (totalProductsElement) {
                    totalProductsElement.innerHTML = `(${totalProducts})items`
                }
                const taem = document.getElementById('actualamount')
                if (taem) {
                    taem.innerHTML = rupee.format(totalAmount.toFixed(2))
                }
            } else {
                if (data.err) return location.href = '/err-internal';
                Swal.fire({
                    title: "Sorry!",
                    text: data.message
                });
                console.log(data.message)
            }
        })
        .catch(error => {
            console.error('Error increasing product quantity:', error);
            location.href = '/error-page';
        });
}

function decreaseProductQuantity(productId, productPrice, actualPrice) {
    console.log(`Total price de is ${productPrice}`)
    if (document.getElementById(`form${productId}`).value == 1 || document.getElementById(`form${productId}`).value < 1) return Swal.fire({ title: "!", text: 'Quantity must be atlest 1.' });;
    fetch(`/carts/decreaseCount/${productId}`, {
        method: 'GET'
    }).then((response) => {
        if (!response.ok) {
            console.log('there is an error...')
            throw new Error('Network response was not ok');
        }
        console.log(response)
        return response.json();
    })
        .then((data) => {
            if (data.success) {
                let total = data.productQuantity * productPrice
                let quantity = data.productQuantity
                let totalAmount = data.totalAmount
                let totalDiscount = data.totalDiscount
                let totalProducts = data.totalProducts
                let actualamount = data.productQuantity * actualPrice
                localStorage.removeItem('CouponDetails')

                const quantityInput = document.getElementById(`form${productId}`);
                if (quantityInput) {
                    quantityInput.value = quantity;
                }
                const ActualPriceElement = document.getElementById(`tprice${productId}`)
                if (ActualPriceElement) {
                    ActualPriceElement.innerHTML = rupee.format(actualamount.toFixed(2));
                }
                const totalDiscountElement = document.getElementById('discountamount')
                if (totalDiscountElement) {
                    totalDiscountElement.innerHTML = rupee.format(totalDiscount.toFixed(2));
                }
                const totalPriceElement = document.getElementById(`totalproductPrice${productId}`);
                if (totalPriceElement) {
                    totalPriceElement.innerHTML = rupee.format(total.toFixed(2));
                }
                const totalAmountElement = document.getElementById('totalAmount')
                if (totalAmountElement) {
                    totalAmountElement.innerHTML = rupee.format(totalAmount - totalDiscount.toFixed(2))
                }
                const totalProductsElement = document.getElementById('totalProducts')
                if (totalProductsElement) {
                    totalProductsElement.innerHTML = `(${totalProducts})items`
                }
                const taem = document.getElementById('actualamount')
                if (taem) {
                    taem.innerHTML = rupee.format(totalAmount.toFixed(2))
                }
            } else {
                if (data.err) return location.href = '/err-internal';
                Swal.fire({ title: "!", text: data.message });
                console.log(data.message)
            }
        })
        .catch(error => {
            console.error('Error increasing product quantity:', error);
        });
}

function removeItem(productId) {
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
            fetch(`/carts/remove/${productId}`, { method: 'DELETE' }).then((response) => {
                if (!response.ok) {
                    console.log('there is an error...')
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then((data) => {
                if (data.success) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success"
                    });
                    localStorage.removeItem('CouponDetails')
                    setTimeout(() => {
                        location.reload()
                    }, 500);
                } else {
                    if (data.err) return location.href = '/err-internal';
                    alert(data.message)
                }
            }).catch((err) => {
                console.log('error is at catch in deleteCart.')
            })

        }
    })
}