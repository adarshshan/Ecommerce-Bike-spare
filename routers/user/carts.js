const express = require('express')
const router = express.Router()
const controller = require('../../controller/cartController')
const orderController=require('../../controller/orderController')
const Order=require('../../models/order')

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
router.get('/changeStatus/:id/:status',async (req,res)=>{
    try {
        const orderId=req.params.id
        const status=req.params.status
        console.log(`order id is ${orderId} and Status is ${status}`)
        const updated=await Order.findOneAndUpdate({'orders._id':orderId},{$set:{'orders.$.products.$[].status':status}})
        if(updated){
            console.log('status updated')
            return res.json({success:true,message:'Status updated'})
        }else{
            console.log('Status failed to update')
            return res.json({success:false,message:'Status failed to update'})
        }
    } catch (error) {
        console.log(error)
        return res.json({success:false,message:'Unknown Error'})
    }
})

module.exports = router