const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')

router.get('/', async (req, res) => {
    try {
        const userId = req.session.currentUserId
        const cartList = await Cart.find({userId:userId}).sort({ created_at: -1 })
        .populate({
            path:'products.productId',
            select:'name price image description stock'
        })
        // res.send(cartList)
        console.log(cartList)
        // res.send(`its teh re ${cartList}`)
        return res.render('user/cart.ejs',{title:'shopping Cart',cartList})
    } catch (error) {
        console.log(`An Error occured at ...${error}`)
    }

})
router.post('/add/:id', async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.session.currentUserId
        const existCart=await Cart.findOne({userId:userId})
        const productItem = await product.find({ _id: id })
        if(existCart){
            let push=await Cart.findOneAndUpdate({userId:userId},{$push:{products:{productId:id}}})
            if(push){
                res.redirect('/carts')
            }
        }else{
            const resu=await Cart.insertMany({
                userId:userId,
                products:[{productId:id}] 
            })
            if(resu){
                res.redirect('/carts')
            }else{
                res.send('Somthing  trouble in inserting data')
            }
        }
        
    } catch (error) {
        console.log(error)
    }


})

router.post('/', (req, res) => {

})

module.exports = router