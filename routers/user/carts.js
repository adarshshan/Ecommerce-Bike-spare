const express = require('express')
const router = express.Router()
const controller = require('../../controller/cartController')
const orderController=require('../../controller/orderController')

//----cart----
router.get('/', controller.cartHome)
router.post('/add/:id/:name/:price/:image', controller.addCart)
router.get('/remove/:id', controller.removeCart)
router.get('/increaseCount/:id', controller.increaseCount)
router.get('/decreaseCount/:id', controller.decreaseCount)


//---Order Side......

router.get('/payment_option/:id/:name/:phone',orderController.paymentOptionPage)
router.post('/orders/:value',orderController.orderPost)
router.get('/orders',orderController.orderHomePage)
router.get('/view_order/:id',orderController.viewOrder)
router.get('/cancelOrder/:id',orderController.cancelOrder)

module.exports = router