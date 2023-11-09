
async function placeOrder(val) {
    console.log('Entered into the function placeorder' + val)
    const response = await fetch(`/carts/orders/${val}`, {
        method: 'post',
        body: JSON.stringify()
    })
    try {
        const resBody = await response.json();
        // const blob = await response.blob();
        // console.log(blob)
        console.log('success part....')
        // console.log(resBody)
        if (resBody.success) {
            document.getElementById('pay').style.display = 'none'
            document.getElementById('myForm').innerHTML = `
            <div class="bg light col-md-8 col-12 p-5 text-success d-flex">
                <div>
                    <h1>Order placed successfully </h1> <br>
                    <a href="/carts/orders" class="btn btn-success px-2">Go to Orders</a>
                </div>
                <button id="downloadInvoiceBtn">Download Invoice</button>
   
            </div>`
            document.getElementById('downloadInvoiceBtn').addEventListener('click', async () => {
              try {
              const downloadLink = document.createElement('a');
              downloadLink.href = URL.createObjectURL(blob);
              downloadLink.download = 'result.pdf';
              downloadLink.click();
              } catch (error) {
                console.log('Error occuring while downloading the invoice')
                console.log(error);
              }
            })
        }
    } catch (error) {
      console.log(error)
        console.log('Error is at resBody')
    }
    console.log('haaai')
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

// function createInvoice() {
//     var data = getSampleData();
//       easyinvoice.createInvoice(data, function(result) {
//       document.getElementById('invoiceBase64').innerText = result.pdf;
//       /* console.log(result.pdf); */
//     });
//   }
  
//   function downloadInvoice() {
//     var data = getSampleData();
//       easyinvoice.createInvoice(data, function(result) {
//         easyinvoice.download('myInvoice.pdf', result.pdf);
//       //	you can download like this as well:
//       //	easyinvoice.download();
//       //	easyinvoice.download('myInvoice.pdf');
//     });
//   }
  
//   function renderInvoice(){
//       var data = getSampleData();
//     document.getElementById("pdf").innerHTML = "loading...";
//       easyinvoice.createInvoice(data, function(result) {
//         easyinvoice.render('pdf', result.pdf);
//     });
//   }
  
//   function getSampleData() {
//       return {
//           images: {
//               logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
//               background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg'
//           },
//           sender: {
//               company: 'SpareKit',
//               address: 'sparekit, malappuram',
//               zip: '1234 AB',
//               city: 'Malappuram',
//               country: 'India'
//           },
//           client: {
//               company: 'Brototype',
//               address: 'calicut 676506',
//               zip: '4567 CD',
//               city: 'calicut',
//               country: 'India'
//           },
//           information: {
//               number: '2021.0001',
//               date: '12-12-2021',
//               'due-date': '31-12-2021'
//           },
//           products: [
//               {
//                   quantity: 2,
//                   description: 'Product 1',
//                   'tax-rate': 6,
//                   price: 33.87
//               },
//               {
//                   quantity: 4.1,
//                   description: 'Product 2',
//                   'tax-rate': 6,
//                   price: 12.34
//               },
//               {
//                   quantity: 4.5678,
//                   description: 'Product 3',
//                   'tax-rate': 21,
//                   price: 6324.453456
//               }
//           ],
//           'bottom-notice': 'Kindly pay your invoice within 15 days.',
//           settings: {
//               currency: 'INR'
//           }
//       };
//   }
  