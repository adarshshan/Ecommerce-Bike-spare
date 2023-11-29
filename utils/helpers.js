const Cart = require('../models/cart');
const Order = require('../models/order')
const User = require('../models/user')
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay')
var instance = new Razorpay({ key_id: 'rzp_test_kxpY9d3K4xgnJt', key_secret: 'NH5mIiVcgS7yf9zr0iwQisAQ' })

async function removeCart(userId, req) {
    delete req.session.selectedAddress
    const deleted = await Cart.findOneAndDelete({ userId: userId })
    if (deleted) {
        console.log('The cart is no more....')
    } else {
        console.log('somthing trouble while deleting the cart')
    }
}

async function changePaymentStatu(orderId) {
    try {
        console.log(`orderId:${orderId}`);
        const updated = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': 'PLACED' } })
        if (updated) {
            console.log('order status updated...');
            return true;
        } else {
            console.log('Order status Failed to update...');
            return false;
        }
    } catch (error) {
        console.log(error)
    }
}

function veryfyPayment(payment, order) {
    return new Promise((resolve, reject) => {
        const Crypto = require('crypto')
        let hmac = Crypto.createHmac('sha256', 'NH5mIiVcgS7yf9zr0iwQisAQ')

        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == payment.razorpay_signature) {
            resolve()
            console.log('resolved')
        } else {
            reject()
            console.log('rejected')

        }
    })
}

function veryfyPaymentwallt(payment, wallet) {
    try {
        return new Promise((resolve, reject) => {
            const Crypto = require('crypto')
            let hmac = Crypto.createHmac('sha256', 'NH5mIiVcgS7yf9zr0iwQisAQ')

            hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
            hmac = hmac.digest('hex')
            if (hmac == payment.razorpay_signature) {
                resolve()
                console.log('resolved')
            } else {
                reject()
                console.log('rejected')

            }
        })
    } catch (error) {
        console.log('Error occured at veryfyPaymentwallt')
        console.log(error)
    }
}

async function decreaseWalletBalance(userId, amount) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': -amount },
                $push: {
                    'wallet.transactions': {
                        type: 'credited',
                        amount: amount,
                        description: 'Products purchased.',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        )
        if (updatedUser) {
            console.log('amount deducted from the wallet...');
        } else {
            console.log('failed to deduct the balance.');
        }
    } catch (error) {
        console.log(error)
    }
}

async function changePaymentStatus(invoice) {
    try {
        const updated = await Order.findOneAndUpdate({ 'orders.invoice': invoice }, { $set: { 'orders.$.products.$[].status': 'PLACED' } })
        if (updated) {
            console.log('order status updated...');
        } else {
            console.log('Order status Failed to update...');
        }
    } catch (error) {
        console.log(error)
    }
}

function generateInvoiceNumber() {
    const prefix = "SPK";
    const year = new Date().getFullYear();
    const uniqueIdentifier = generateUniqueIdentifier();
    const suffix = "";

    const invoiceNumber = `${prefix}-${year}-${uniqueIdentifier}${suffix}`;
    return invoiceNumber;
}
function generateUniqueIdentifier() {
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return randomNumber;
}

function getSampleData(invoiceNumber, items, name, phone, userName, userPhone, userEmail, paymentMethod, date, discount, totalAmount, wallet, totalDiscount) {
    return {
        BilledTo: {
            name: userName,
            phone: userPhone,
            email: userEmail
        },
        sender: {
            company: 'SpareKit',
            address: 'sparekit, malappuram',
            zip: '1234 AB',
            city: 'Malappuram',
            country: 'India'
        },
        client: {
            client: name,
            phone: phone,
            address: '4567 CD',
            city: 'calicut',
            country: 'India'
        },
        information: {
            number: invoiceNumber,
            method: paymentMethod,
            discount: parseInt(discount) || 0,
            totalDiscount: parseFloat(totalDiscount),
            totalAmount: parseInt(totalAmount),
            wallet: parseInt(wallet) || 0,
            date: new Date().toLocaleString('en-GB', {
                hour12: false,
            })
        },
        products: items,
        'bottom-notice': 'Kindly pay your invoice within 30 days.',
        settings: {
            currency: 'INR'
        }
    };
}


async function calculateTotalAmount(matchCriteria) {
    console.log('Matching criteria:', matchCriteria);

    const result = await Cart.aggregate([
        {
            $match: matchCriteria
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $group: {
                _id: null,
                totalAmount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    {
                                        $subtract: [
                                            "$product.price",
                                            { $multiply: ["$product.price", { $divide: ["$product.discount", 100] }] }
                                        ]
                                    },
                                    "$products.quantity"
                                ]
                            },
                            else: { $multiply: ["$product.price", "$products.quantity"] }
                        }
                    }
                },
                totalDiscount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    "$product.price",
                                    { $divide: ["$product.discount", 100] },
                                    "$products.quantity"
                                ]
                            },
                            else: 0
                        }
                    }
                },
                totalProducts: { $sum: 1 }
            }
        }
    ]);


    console.log('Aggregation result:', result);




    if (result.length > 0) {
        console.log('Total Amount:', result[0].totalAmount);
        console.log(`totalProducts ${result[0].totalProducts}`)
        console.log(`totalDiscount ${result[0].totalDiscount}`)
        let totalAmount = result[0].totalAmount
        let totalProducts = result[0].totalProducts
        let totalDiscount = result[0].totalDiscount
        return { totalAmount, totalProducts, totalDiscount };
    } else {
        console.log('No results found.');
        return 0; // Return 0 if no results
    }
};



function addWalletAmount(userId, wallet) {
    let amount=wallet.amount/100;
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': amount},
                $push: {
                    'wallet.transactions': {
                        type: 'debited',
                        amount: amount,
                        description: 'fund add by the user',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        ).then((updatedUser) => {
            console.log(`updateddddd...`)
            console.log(updatedUser)
            resolve(updatedUser)
            console.log('resolved')
        })
            .catch((err) => {
                console.log(err)
                console.log('somthing trouble while update the wallet balance.')
                reject()
                console.log('rejected..')
            })
    })
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})
async function sendUriToEmail(email, req) {
    const userId = req.session.currentUserId
    const user = await User.findById(userId)
    const refferalCode = user.refferalCode
    mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Hello Costomer.',
        html: `<p>This is your refferal link. <b>http://localhost:3000/users/signup/?refferalCode=${refferalCode}</b> You will get 50rs wallet balance, by signup using this refferal link.</p>
        <p><b>Hurry up join with us</b></p>`
    }
    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Success parttt')
        }
    })
}

function generateRazorpay(total, orderId) {
    return new Promise((resolve, reject) => {
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: orderId
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log('error is here.')
                console.log(err)
            } else {
                resolve(order);
            }
        });
    })
}


module.exports = {
    removeCart,
    changePaymentStatus,
    veryfyPayment,
    decreaseWalletBalance,
    generateInvoiceNumber,
    getSampleData,
    calculateTotalAmount,
    changePaymentStatu,
    veryfyPaymentwallt,
    addWalletAmount,
    sendUriToEmail,
    generateRazorpay

}