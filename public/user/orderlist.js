async function returnOrder(id) {
    try {
        const response = await fetch(`/carts/return-product/${id}`);
        const resBody = await response.json()
        if (resBody.success) {
            alert(resBody.message)
        } else {
            alert(resBody.message)
        }
    } catch (error) {
        console.log(error)
    }
}
async function cancelOrder(id) {
    try {
        const response = await fetch(`/carts/cancelOrder/${id}`, { method: 'get' });
        const resBody = await response.json();
        if (resBody.success) {
            alert(resBody.message)
            setTimeout(() => {
                location.reload()
            }, 500);
        } else {
            alert(resBody.message)
        }
    } catch (error) {
        console.log(error)
    }
}

