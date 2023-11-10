
function renderInvoice(invoiceData) {
    // Use invoiceData to dynamically generate the invoice HTML
    const invoiceHtml = `
    <div class="row">
            <div class="col-xs-12">
                <div class="invoice-title">
                    <h2>Invoice</h2>
                    <h3 class="pull-right">Order # 12345</h3>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6 col-lg-6 col-12">
                        <address>
                            <strong>Billed To:</strong><br>
                            John Smith<br>
                            1234 Main<br>
                            Apt. 4B<br>
                            Springfield, ST 54321
                        </address>
                    </div>
                    <div class="col-md-6 col-lg-6 col-12 text-right">
                        <address>
                            <strong>Shipped To:</strong><br>
                            Jane Smith<br>
                            1234 Main<br>
                            Apt. 4B<br>
                            Springfield, ST 54321
                        </address>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <address>
                            <strong>Payment Method:</strong><br>
                            Visa ending **** 4242<br>
                            jsmith@email.com
                        </address>
                    </div>
                    <div class="col-md-6 text-right">
                        <address>
                            <strong>Order Date:</strong><br>
                            March 7, 2014<br><br>
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
                                    <tr>
                                        <td>BS-200</td>
                                        <td class="text-center">$10.99</td>
                                        <td class="text-center">1</td>
                                        <td class="text-right">$10.99</td>
                                    </tr>
                                    <tr>
                                        <td>BS-400</td>
                                        <td class="text-center">$20.00</td>
                                        <td class="text-center">3</td>
                                        <td class="text-right">$60.00</td>
                                    </tr>
                                    <tr>
                                        <td>BS-1000</td>
                                        <td class="text-center">$600.00</td>
                                        <td class="text-center">1</td>
                                        <td class="text-right">$600.00</td>
                                    </tr>
                                    <tr>
                                        <td class="thick-line"></td>
                                        <td class="thick-line"></td>
                                        <td class="thick-line text-center"><strong>Subtotal</strong></td>
                                        <td class="thick-line text-right">$670.99</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"><strong>Shipping</strong></td>
                                        <td class="no-line text-right">$15</td>
                                    </tr>
                                    <tr>
                                        <td class="no-line"></td>
                                        <td class="no-line"></td>
                                        <td class="no-line text-center"><strong>Total</strong></td>
                                        <td class="no-line text-right">$685.99</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Append the generated HTML to the "invoice-container" div
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
            <div class="bg light col-md-8 col-12 text-success d-flex">
                <div>
                    <h1>Order placed successfully </h1> <br>
                    <a href="/carts/orders" class="btn btn-success px-2">Go to Orders</a>
                </div>
                <button class="btn btn-success" onclick="downloadInvoice()">Download Invoice</button>
            </div>
            <div class="bg light col-md-8 col-12 p-5" id="invoice-container"></div>`
            const receivedInvoiceData = resBody.invoiceData;
            renderInvoice(receivedInvoiceData);
        }
    } catch (error) {
      console.log(error)
        console.log('Error is at resBody')
    }
}

async function downloadInvoice() {
    // Assume you have a function to convert HTML to a Blob
    const containerHtml =await  document.getElementById('invoice-container').innerHTML;
    // const blob = htmlToBlob(document.getElementById('invoice-container').innerHTML);

    htmlToBlob(containerHtml, function (blob) {
        // Create a download link and trigger the download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'invoice.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function htmlToBlob(html, callback) {
    html2pdf(html, {
        margin: 10,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
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
            alert("Selected Option: " + selectedValue);
            placeOrder(selectedValue);
        } catch (error) {
            console.log(`Somthing went wrong ${error}`)
        }

    } else {
        alert("Please select an option.");
    }
})
