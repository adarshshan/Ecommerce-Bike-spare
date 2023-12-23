
function renderInvoice(invoiceData) {
    let products = ''
    let subtotal = 0;
    for (let i = 0; i < invoiceData.products.length; i++) {
        products += `
    <tr>
        <td>${invoiceData.products[i].productName}</td>
        <td class="text-center">${invoiceData.products[i].productPrice}</td>
        <td class="text-center">${invoiceData.products[i].quantity}</td>
        <td class="text-right">${invoiceData.products[i].quantity * invoiceData.products[i].productPrice}</td>
    </tr>`
        subtotal += invoiceData.products[i].quantity * invoiceData.products[i].productPrice;
    }
    // Use invoiceData to dynamically generate the invoice HTML
    const invoiceHtml = `
    <div class="row">
            <div class="col-xs-12">
                <div class="invoice-title">
                    <h2>Invoice</h2>
                    <h3 class="pull-right">${invoiceData.information.number}</h3>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6 col-lg-6">
                        <address>
                            <strong>Billed To:</strong><br>
                            ${invoiceData.BilledTo.name}<br>
                            ${invoiceData.BilledTo.phone}<br>
                            ${invoiceData.BilledTo.email}<br>
                        </address>
                    </div>
                    <div class="col-md-6 col-lg-6 text-right">
                        <address>
                            <strong>Shipped To:</strong><br>
                            ${invoiceData.client.client}<br>
                            Mobile: ${invoiceData.client.phone}<br>
                        </address>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <address>
                            <strong>Payment Method:</strong><br>
                            ${invoiceData.information.method}<br>
                            ${invoiceData.BilledTo.email}
                        </address>
                    </div>
                    <div class="col-md-6 text-right">
                        <address>
                            <strong>Order Date:</strong><br>
                            ${invoiceData.information.date}<br><br>
                        </address>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title"><strong>Order summary</strong></h3>
                    </div>
                    <div class="panel-body">
                        <div class="table-responsive">
                            <table class="table table-condensed">
                                <thead>
                                    <tr>
                                        <td><strong>Item</strong></td>
                                        <td class="text-center"><strong>Price</strong></td>
                                        <td class="text-center"><strong>Quantity</strong></td>
                                        <td class="text-right"><strong>Totals</strong></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- foreach ($order->lineItems as $line) or some such thing here -->
                                    
                                    ${products}

                                    <tr>
                                        <td class="thick-line"><strong>Subtotal</strong></td>
                                        <td class="thick-line"></td>
                                        <td class="thick-line text-center"></td>
                                        <td class="thick-line text-right">Rs.${subtotal}</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"><strong>Paid from wallet balance </strong></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"></td>
                                        <td class="no-line text-right">Rs.${invoiceData.information.wallet}</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"><strong>Discount on products</strong></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"></td>
                                        <td class="no-line text-right text-success">-Rs.${invoiceData.information.totalDiscount}</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"><strong>Coupon Discount</strong></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"></td>
                                        <td class="no-line text-right text-success">-Rs.${invoiceData.information.discount}</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"><strong>Shipping</strong></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"></td>
                                        <td class="no-line text-right">Rs.00</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"><strong>Total</strong></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"></td>
                                        <td class="no-line text-right">Rs.${invoiceData.information.totalAmount+invoiceData.information.wallet}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('invoice-container').style.border = '2px solid black'
    document.getElementById('invoice-container').innerHTML = invoiceHtml;
}

async function placeOrder(val) {
    const response = await fetch(`/carts/orders/${val}`, {
        method: 'post',
        body: JSON.stringify()
    })
    try {
        const resBody = await response.json();
        if (resBody.success) {
            document.getElementById('pay').style.display = 'none'
            document.getElementById('myForm').innerHTML = `
            <div class="bg-light col-md-8 col-12 p-2 text-success d-flex">
                <div>
                    <h1>Order placed successfully </h1> <br>
                    <a href="/carts/orders" class="btn btn-success">Go to Orders</a>
                </div>
                <p class="btn border-0 fw-bold py-3 float-end" id="download-button" onclick="downloadInvoice()"><i class="fa-solid fa-download fs-5"></i></p>
            </div>
            <div class="col-md-8 col-12 p-2 mb-4" id="invoice-container" style="background-color: rgb(251, 255, 255);"></div>`
            const receivedInvoiceData = resBody.invoiceData;
            document.getElementById('couponbox').style.display='none'
            openPopup();
            renderInvoice(receivedInvoiceData);
        } else if (resBody.online) {
            const receivedInvoiceData = resBody.invoiceData;
            razorpayPayment(resBody.result,receivedInvoiceData)
            document.getElementById('couponbox').style.display='none'
        }else{
            document.getElementById('Errormsg').innerText=resBody.message;
            setTimeout(() => {
                document.getElementById('Errormsg').innerText='';
            }, 5000);
        }
    } catch (error) {
        console.log(error)
        console.log('Error is at resBody')
    }
}

function razorpayPayment(order,receivedInvoiceData) {
    var options = {
        "key": "rzp_test_kxpY9d3K4xgnJt", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "SpareKit",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id,
        "handler": function (response) {
            veryfyPayment(response, order,receivedInvoiceData);
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
function veryfyPayment(payment, order,receivedInvoiceData) {
    $.ajax({
        url: '/carts/veryfy-payment',
        method: 'post',
        data: {
            payment,
            order
        },
        success: (response) => {
            if (response.status) {
                document.getElementById('pay').style.display = 'none'
                document.getElementById('myForm').innerHTML = `
            <div class="bg-light col-md-8 col-12 text-success p-2 d-flex">
                <div>
                    <h1>Order placed successfully </h1> <br>
                    <a href="/carts/orders" class="btn btn-success">Go to Orders</a>
                </div>
                <p class="btn border-0 fw-bold py-3 float-end" id="download-button" onclick="downloadInvoice()"><i class="fa-solid fa-download fs-5"></i></p>
            </div>
            <div class="col-md-8 col-12 p-2 mb-4" id="invoice-container" style="background-color: rgb(251, 255, 255);"></div>`
                
                openPopup();
                renderInvoice(receivedInvoiceData);
            }else{
                alert(`payment failed`);
                rzp1.open();
            }
        }
    })
}

// Alert Popup
function openPopup() {
    popup.classList.add('open-popup');
}
function closePopup() {
    popup.classList.remove('open-popup');
}

async function downloadInvoice() {
    // Assume you have a function to convert HTML to a Blob
    const containerHtml = document.getElementById('invoice-container').innerHTML;

    htmlToBlob(containerHtml, function (blob) {
        // Create a download link and trigger the download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'invoice.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    setTimeout(() => {
        document.getElementById('invoice-container').style.display = 'none';
        document.getElementById('download-button').style.display = 'none';
    }, 2000);
    
}

function htmlToBlob(html, callback) {
    html2pdf(html, {
        margin: 10,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).then(function (pdf) {
        callback(pdf.output('blob'));
    });
}

document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    var selectedOption = document.querySelector('input[name="payment"]:checked');

    if (selectedOption) {
        try {
            var selectedValue = selectedOption.value;
            placeOrder(selectedValue);
        } catch (error) {
            console.log(`Somthing went wrong ${error}`)
        }

    } else {
        alert("Please select an option.");
    }
})
///order List

async function showInvoice(id) {
    try {
        const response = await fetch(`/carts/invoice/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            renderorderInvoice(resbody.selectedOrder);
        }
    } catch (error) {
        console.log(error)
    }
}
function renderorderInvoice(order) {
    try {
        document.getElementById('invoice-container').style.display = 'block';
        let products = ''
        let subtotal = 0;
        for (let i = 0; i < order.products.length; i++) {
            products += `
                        <tr>
                            <td>${order.products[i].productName}</td>
                            <td class="text-center">${order.products[i].productPrice}</td>
                            <td class="text-center">${order.products[i].quantity}</td>
                            <td class="text-right">${order.products[i].quantity * order.products[i].productPrice}</td>
                         </tr>`
            subtotal += order.products[i].quantity * order.products[i].productPrice;
        }
        // Use invoiceData to dynamically generate the invoice HTML
        const invoiceHtml = `
        <div class="row" id="header-invoice">
            <div class="col-12" style="cursor: pointer;">
                <i onclick="downloadInvoice()" class="fa-solid fa-download float-end fs-4"></i>
                <i onclick="closeInvoice()" class="fa-solid fa-xmark float-end me-3 fs-4"></i>
                </div>
            </div>
<div class="row">
<div class="col-xs-12">
<div class="invoice-title">
    <h3 class="pull-right">Invoice ${order.invoice}</h3>
</div>
<hr>
<div class="row">
    <div class="col-md-6 col-lg-6 col-12">
        <address>
            <strong>Billed To:</strong><br>
            ${order.address.addressName}<br>
            ${order.address.addressPhone}<br>
        </address>
    </div>
    <div class="col-md-6 col-lg-6 col-12 text-right">
        <address>
            <strong>Shipped To:</strong><br>
            ${order.address.addressName}<br>
            Mobile: ${order.address.addressPhone}<br>
        </address>
    </div>
</div>
<div class="row">
    <div class="col-md-6">
        <address>
            <strong>Payment Method:</strong><br>
            ${order.paymentMethod}<br>
        </address>
    </div>
    <div class="col-md-6 text-right">
        <address>
            <strong>Order Date:</strong><br>
            ${order.date}<br><br>
        </address>
    </div>
</div>
</div>
</div>

<div class="row">
<div class="col-md-12">
<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title"><strong>Order summary</strong></h3>
    </div>
    <div class="panel-body">
        <div class="table-responsive">
            <table class="table table-condensed">
                <thead>
                    <tr>
                        <td><strong>Item</strong></td>
                        <td class="text-center"><strong>Price</strong></td>
                        <td class="text-center"><strong>Quantity</strong></td>
                        <td class="text-right"><strong>Totals</strong></td>
                    </tr>
                </thead>
                <tbody>
                    <!-- foreach ($order->lineItems as $line) or some such thing here -->
                    
                    ${products}

                    <tr>
                        <td class="thick-line"><strong>Subtotal</strong></td>
                        <td class="thick-line"></td>
                        <td class="thick-line text-center"></td>
                        <td class="thick-line text-right">Rs.${subtotal}</td>
                    </tr>
                    <tr>
                        <td class="no-line"><strong>Paid from wallet balance </strong></td>
                        <td class="no-line"></td>
                        <td class="no-line text-center"></td>
                        <td class="no-line text-right">Rs.${order.walletAmount}</td>
                    </tr>
                    <tr>
                        <td class="no-line"><strong>Discount on products</strong></td>
                        <td class="no-line"></td>
                        <td class="no-line text-center"></td>
                        <td class="no-line text-right text-success">-Rs.${order.ProductDiscount}</td>
                    </tr>
                    <tr>
                        <td class="no-line"><strong>Coupon Discount</strong></td>
                        <td class="no-line"></td>
                        <td class="no-line text-center"></td>
                        <td class="no-line text-right text-success">-Rs.${order.couponDiscount}</td>
                    </tr>
                    <tr>
                        <td class="no-line"><strong>Shipping</strong></td>
                        <td class="no-line"></td>
                        <td class="no-line text-center"></td>
                        <td class="no-line text-right">Rs.00</td>
                    </tr>
                    <tr>
                        <td class="no-line"><strong>Total</strong></td>
                        <td class="no-line"></td>
                        <td class="no-line text-center"></td>
                        <td class="no-line text-right">Rs.${order.totalAmount + order.walletAmount}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</div>
</div>`;
        document.getElementById('invoice-container').innerHTML = invoiceHtml;
    } catch (error) {
        console.log(error)
    }
}
function closeInvoice() {
    document.getElementById('invoice-container').style.display = 'none';
}
