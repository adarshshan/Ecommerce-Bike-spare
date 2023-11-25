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
const order = require('../../models/order')


//----cart----
router.get('/', controller.cartHome)
router.get('/add/:id/:name/:price/:image/:disc', userAuth, controller.addCart)
router.get('/remove/:id', userAuth, controller.removeCart)
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
router.get('/buy-now/:id/:name/:price/:image/:disc/:discount', async (req, res) => {
    try {
        const id = req.params.id//product id
        const name = req.params.name
        const price = req.params.price
        const imageUri = req.params.image
        const discription = req.params.disc;
        const discount=req.params.discount
        const userId = req.session.currentUserId
        const item = {
            id: id,
            name: name,
            price: price,
            imageUri: imageUri,
            discription: discription,
            discount:discount
        }
        localStorage.setItem('product', JSON.stringify(item))
        // let newObject = localStorage.getItem("product");
        // console.log(JSON.parse(newObject));
        // let product = JSON.parse(localStorage.getItem("product"));
        // console.log(product)
        if(localStorage.getItem("product")){
            res.json({success:true,message:'product Details successfully added to the localstorrage'})
        }else{
            res.json({success:false,message:'Failed to add product Details to localstorrage'})
        }
        
        
    } catch (error) {
        console.log(error)
    }
})




module.exports = router