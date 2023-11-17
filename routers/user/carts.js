const express = require('express')
const router = express.Router()
const controller = require('../../controller/cartController')
const orderController = require('../../controller/orderController')
const Order = require('../../models/order')
const Cart = require('../../models/cart')
const userAuth = require('../../middlware/userAuth')
const adminAuth = require('../../middlware/adminAuth')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;



//----cart----
router.get('/', controller.cartHome)
router.post('/add/:id/:name/:price/:image/:disc', controller.addCart)
router.get('/remove/:id', controller.removeCart)
router.get('/increaseCount/:id', controller.increaseCount)
router.get('/decreaseCount/:id', controller.decreaseCount)


//---Order Side......

router.get('/payment_option/:id/:name/:phone', userAuth, orderController.paymentOptionPage)
router.post('/orders/:value', userAuth, orderController.orderPost)
router.get('/orders', userAuth, orderController.orderHomePage)
router.get('/view_order/:id/:Tamount/:Pmethod/:aName/:aPhone/:date/:invoice', userAuth, orderController.viewOrder)
router.get('/cancelOrder/:id', userAuth, orderController.cancelOrder)
router.get('/changeStatus/:id/:status', adminAuth, orderController.changeStatus)
router.post('/veryfy-payment', (req, res) => {
    const { payment, order } = req.body
    veryfyPayment(payment, order).then(() => {
        removeCart(req.session.currentUserId,req);//to delete the existing cart details
        changePaymentStatus(order.receipt).then(() => {
            console.log('payment successful');
            res.json({ status: true, message: 'payment successful and status changed!.' });
        }).catch((err) => {
            console.log(err)
            console.log('payment failed and status not updated.')
            res.json({ status: false, message: 'payment failed and status not updated.' });
        })
    }).catch((err) => {
        console.log(err)

        res.json({ status: false, message: 'Somthing went wrong' })
    })
})



//additional functions:

async function removeCart(userId,req) {
    delete req.session.selectedAddress
    const deleted = await Cart.findOneAndDelete({ userId: userId })
    if (deleted) {
        console.log('The cart is no more....')
    } else {
        console.log('somthing trouble while deleting the cart')
    }
}

async function changePaymentStatus(orderId) {
    try {
        const updated = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': 'PLACED' } })
        if (updated) {
            console.log('order status updated...');
        } else {
            console.log('Order status Failed to update...');
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
module.exports = router