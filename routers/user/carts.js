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
const localStorage = require("localStorage")
const helpers = require('../../utils/helpers')
const Product = require('../../models/product')


//----cart----
router.get('/', controller.cartHome)
router.get('/add/:id/:name/:price/:image/:disc', controller.addCart)
router.delete('/remove/:id', userAuth, controller.removeCart)
router.get('/increaseCount/:id', userAuth, controller.increaseCount)
router.get('/decreaseCount/:id', userAuth, controller.decreaseCount)


//---Order Side......

router.get('/payment_option/:id/:name/:phone', userAuth, orderController.paymentOptionPage)
router.post('/orders/:value', userAuth, orderController.orderPost)
router.get('/orders', userAuth, orderController.orderHomePage)
router.get('/view_order/:id/:Tamount/:Pmethod/:aName/:aPhone/:date/:invoice', userAuth, orderController.viewOrder)
router.get('/cancelOrder/:id', userAuth, orderController.cancelOrder)
router.get('/changeStatus/:id/:status', adminAuth, orderController.changeStatus)
router.post('/veryfy-payment', userAuth, orderController.verifyPayment)
router.get('/return-product/:id', userAuth, orderController.returnProduct);
router.get('/buy-now/:id/:name/:price/:image/:disc/:discount', orderController.buyNow)
router.get('/review-page/:productid/:name', orderController.reviewPage)
router.post('/review', orderController.postReview)
router.get('/invoice/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const orderElem = await Order.findOne({ orders: { $elemMatch: { _id: orderId } } },{_id:0,'orders.$':1})
        const selectedOrder=orderElem.orders[0];
        console.log(selectedOrder)
        return res.json({success:true,selectedOrder});
    } catch (error) {
        console.log(error)
    }
})




module.exports = router