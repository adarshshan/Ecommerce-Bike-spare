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
            let total = data.productQuantity * productPrice
            let quantity = data.productQuantity
            let totalAmount = data.totalAmount
            let totalDiscount=data.totalDiscount
            let totalProducts = data.totalProducts
            let actualamount = data.productQuantity * actualPrice

            const quantityInput = document.getElementById(`form${productId}`);
            if (quantityInput) {
                quantityInput.value = quantity;
            }
            const totalPriceElement = document.getElementById(`totalproductPrice${productId}`);
            if (totalPriceElement) {
                totalPriceElement.innerHTML = total;
            }
            const totalDiscountElement=document.getElementById('discountamount')
            if(totalDiscountElement){
                totalDiscountElement.innerHTML=totalDiscount;
            }
            const ActualPriceElement = document.getElementById(`tprice${productId}`)
            if (ActualPriceElement) {
                ActualPriceElement.innerHTML = actualamount;
            }
            const totalAmountElement = document.getElementById('totalAmount')
            if (totalAmountElement) {
                totalAmountElement.innerHTML = totalAmount
            }
            const totalProductsElement = document.getElementById('totalProducts')
            if (totalProductsElement) {
                totalProductsElement.innerHTML = `(${totalProducts})items`
            }
            const taem = document.getElementById('actualamount')
            if (taem) {
                taem.innerHTML = totalAmount
            }
        })
        .catch(error => {
            console.error('Error increasing product quantity:', error);
        });
}

function decreaseProductQuantity(productId, productPrice, actualPrice) {
    console.log(`Total price de is ${productPrice}`)
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
            let total = data.productQuantity * productPrice
            let quantity = data.productQuantity
            let totalAmount = data.totalAmount
            let totalDiscount=data.totalDiscount
            let totalProducts = data.totalProducts
            let actualamount = data.productQuantity * actualPrice

            const quantityInput = document.getElementById(`form${productId}`);
            if (quantityInput) {
                quantityInput.value = quantity;
            }
            const ActualPriceElement = document.getElementById(`tprice${productId}`)
            if (ActualPriceElement) {
                ActualPriceElement.innerHTML = actualamount;
            }
            const totalDiscountElement=document.getElementById('discountamount')
            if(totalDiscountElement){
                totalDiscountElement.innerHTML=totalDiscount;
            }
            const totalPriceElement = document.getElementById(`totalproductPrice${productId}`);
            if (totalPriceElement) {
                totalPriceElement.innerHTML = total;
            }
            const totalAmountElement = document.getElementById('totalAmount')
            if (totalAmountElement) {
                totalAmountElement.innerHTML = totalAmount
            }
            const totalProductsElement = document.getElementById('totalProducts')
            if (totalProductsElement) {
                totalProductsElement.innerHTML = `(${totalProducts})items`
            }
            const taem = document.getElementById('actualamount')
            if (taem) {
                taem.innerHTML = totalAmount
            }
        })
        .catch(error => {
            console.error('Error increasing product quantity:', error);
        });
}