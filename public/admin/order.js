async function refund(orderId){
    const response=await fetch(`/wallet-refund/${orderId}`,{method:'get'})
    const resBody=await response.json()
    if(resBody.success){
        setTimeout(()=>{
            location.reload()
        },500)
    }else{
        alert(resBody.message)
    }
}
async function viewOrders(data){
    const space=document.getElementById('inner');
    const productDetails = JSON.parse(data);
    const response=await fetch(`/orders/view_order/${productDetails.id}/${productDetails.totalAmount}/${productDetails.paymentMethod}/${productDetails.addressName}/${productDetails.addressPhone}/${productDetails.date}`,{method:'get'})
    const resBody=await response.json()
    console.log(resBody.products[0].product.productName)
    if(resBody.success){
        let x=''
        for(let i=0;i<resBody.products.length;i++){
            x+=`
            <div class="row border p-5 mb-4 fs-4 bg-light shadow">
                    <div class="col-12 col-md-4"><img style=" width: 100%;" src="/${resBody.products[i].product.productImage}" alt=""></div>
                    <div class="col-md-4">
                        <p class="fs-3 fw-bold">${resBody.products[i].product.productName }</p>
                        <small>${ resBody.products[i].product.productDiscription}</small>
                    </div>

                    <div class="col-md-4">
                        <p class="fs-4 fw-bold">Order Details</p>
                        <p>status:${ resBody.products[i].product.status }</p>
                        <p>quantity:${ resBody.products[i].product.quantity }</p>
                        <p>Payment method:${ resBody.paymentMethod }</p>
                        <p>Purchased Date:${ resBody.date }</p>
                        <p class="fs-4 fw-bold">Delivery address</p>
                        <p>Name : ${ resBody.name }</p>
                        <p>Phone number : ${resBody.phone }</p>
                    </div>
                </div>`

                space.innerHTML=x;
        }
    }
}

function showform(id) {
    document.getElementById('inner').style.display = "none"
    document.getElementById('select').innerHTML = `
            <div class=" bg-light p-5 card">
            <h2 class="mb-5">Change Status</h2>
            <div class="d-flex">
                <p class="fs-4">Select Status</p>
                <select name="" id="status" class="ms-5">
                    <option value="">Choose</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PLACED">PLACED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                </select>
            </div>
            <div class="d-flex">
                <button onclick="backbutton()" type="button" class="btn btn-outline-success ms-4 px-5 mt-5">Back</button>
            <button onclick="updateStaus('${id}')" type="button" class="btn btn-outline-success ms-4 px-5 mt-5">Change</button>
            </div>
        </div>`
}
function backbutton() {
    document.getElementById('select').style.display = "none"
    document.getElementById('inner').style.display = "block"

}
async function updateStaus(id) {
    const status = document.getElementById('status').value
    const response = await fetch(`/carts/changeStatus/${id}/${status}`, {method:'get'})
    const resBody = await response.json()
    console.log(resBody)
    if (resBody.success) {
        console.log(resBody.message)
        setTimeout(()=>{
            location.reload()
        },500)
        
    } else {
        console.log(resBody.message)
        alert(resBody.message)
    }
}