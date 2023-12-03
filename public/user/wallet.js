let rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', });
function lessPage() {
    try {
        location.reload()
    } catch (error) {
        console.log(error)
    }
}
async function morePage() {
    try {
        const response = await fetch(`/pagination`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            let totalpages = Math.ceil(resBody.transactions.length / 8)
            document.getElementById('less').style.display = 'block'
            if (resBody.page === totalpages) {
                document.getElementById('morePage').style.display = 'none'
            }
            let x = ``;
            for (let i = 0; i < resBody.page * 8; i++) {
                const formattedDate = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                }).format(new Date(resBody.transactions[i].time));

                if (resBody.transactions[i].type === 'debited') {
                    x += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                 <i class="fas fa-arrow-circle-up text-success me-2"></i>
                                  <span class="text-success">received - Rs. ${rupee.format(resBody.transactions[i].amount)}</span>
                                  <p class="transaction-desc">${resBody.transactions[i].description}</p>
                              </div>
                                  <span class="transaction-time">
                                    ${resBody.transactions[i].time.toString().split('T')[0]} -
                                    ${formattedDate}
                                  </span>
                            </li>`
                } else {
                    x += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                 <i class="fas fa-arrow-circle-down text-danger me-2"></i>
                                  <span class="text-success">paid - Rs. ${rupee.format(resBody.transactions[i].amount)}</span>
                                  <p class="transaction-desc">${resBody.transactions[i].description}</p>
                              </div>
                                  <span class="transaction-time">
                                    ${resBody.transactions[i].time.toString().split('T')[0]} -
                                    ${formattedDate}
                                  </span>
                            </li>`
                }
            }
            document.getElementById('transactions').innerHTML = x;
        } else {
            alert('Somthing went wrong');
        }
    } catch (error) {
        console.log(error)
    }
}
async function addFunds() {
    try {
        console.log('clicked')
        const amount = document.getElementById('amount').value
        const response = await fetch(`/add-walletfund/${amount}`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.online) {
            razorpayPayment(resBody.wallet)

        } else {
            document.getElementById('Errormsg').innerText = resBody.message
            setTimeout(() => {
                document.getElementById('Errormsg').innerText = '';
            }, 10000);
        }
    } catch (error) {
        console.log(error)
        document.getElementById('Errormsg').innerText = `Unknown Error  (make sure the input field isn't blank!)`
        setTimeout(() => {
            document.getElementById('Errormsg').innerText = '';
        }, 10000);
    }
}

function razorpayPayment(wallet) {
    var options = {
        "key": "rzp_test_kxpY9d3K4xgnJt",
        "amount": wallet.amount,
        "currency": "INR",
        "name": "SpareKit",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": wallet.id,
        "handler": function (response) {
            veryfyPayment(response, wallet);
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
function veryfyPayment(payment, wallet) {
    $.ajax({
        url: '/veryfy-payment',
        method: 'post',
        data: {
            payment,
            wallet
        },
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    position: "top-center",
                    icon: "success",
                    title: "Wallet recharged successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => {
                    window.location.reload()
                }, 3000);
            } else {
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