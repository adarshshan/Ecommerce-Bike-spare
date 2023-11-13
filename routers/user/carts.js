const express = require('express')
const router = express.Router()
const controller = require('../../controller/cartController')
const orderController=require('../../controller/orderController')
const Order=require('../../models/order')
const userAuth=require('../../middlware/userAuth')
const adminAuth=require('../../middlware/adminAuth')



//----cart----
router.get('/', controller.cartHome)
router.post('/add/:id/:name/:price/:image/:disc', controller.addCart)
router.get('/remove/:id', controller.removeCart)
router.get('/increaseCount/:id', controller.increaseCount) 
router.get('/decreaseCount/:id', controller.decreaseCount)


//---Order Side......

router.get('/payment_option/:id/:name/:phone',userAuth,orderController.paymentOptionPage)
router.post('/orders/:value',userAuth,orderController.orderPost)
router.get('/orders',userAuth,orderController.orderHomePage)
router.get('/view_order/:id/:Tamount/:Pmethod/:aName/:aPhone/:date/:invoice',userAuth,orderController.viewOrder)
router.get('/cancelOrder/:id',userAuth,orderController.cancelOrder)
router.get('/changeStatus/:id/:status',adminAuth,orderController.changeStatus)
router.post('/veryfy-payment',(req,res)=>{
    console.log(`req.body result is `)
    console.log(req.body);
})

module.exports = router