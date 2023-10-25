const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')
const notifier = require('node-notifier');
const path = require('path')

router.get('/', async (req, res) => {
    try {
        const userId = req.session.currentUserId
        const cartId=req.session.cartId
        const cartList = await Cart.find({ userId: userId })
            .populate({
                path: 'products.productId',
                select: 'name price image description stock'
            }).sort({ created_at: -1 })
        if (cartList) {
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList })

        }else{
            const cartList=await Cart.findOne({_id:cartId}).populate({
                path:'products.productId',
                select:'name price image description stock'
            }).sort({ created_at: -1 })
            if(cartList){
                return res.render('user/cart.ejs', { title: 'shopping Cart', cartList })
            }else{
                console.log('An error occured while rendering the cartlist...')
            }
        }
    } catch (error) {
        console.log(`An Error occured at ...${error}`)
    }

})
router.post('/add/:id', async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.session.currentUserId
        if (!userId) {
            const cartId = req.session.cartId
            if (cartId && cartId !== null) {
                await Cart.findByIdAndUpdate(cartId, { $push: { products: { productId: id } } })
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                console.log('products add to existing cart...')
                return res.redirect('/carts')
            } else {
                const resu = await Cart.insertMany({
                    products: [{ productId: id }]
                })
                if (resu) {
                    req.session.cartId = resu[0]._id
                    console.log('Cart id is ' + req.session.cartId);
                    await product.findByIdAndUpdate(id, { $set: { cart: true } })
                    return res.redirect('/carts')
                } else {
                    res.send('Somthing  trouble in inserting data')
                }
            }

        }else{
            const existCart = await Cart.findOne({ userId: userId })
        if (existCart) {
            let push = await Cart.findOneAndUpdate({ userId: userId }, { $push: { products: { productId: id } } })
            if (push) {
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                notifier.notify({
                    title: 'Notifications',
                    message: 'Product successfully added to cart List.. ',
                    icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                    wait: true
                })
                return res.redirect('/carts')
            } else {
                return res.send('Product is not going to the cart list')
            }
        } else {
            const resu = await Cart.insertMany({
                userId: userId,
                products: [{ productId: id }]
            })
            if (resu) {
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                res.redirect('/carts')
            } else {
                res.send('Somthing  trouble in inserting data')
            }
        }

        }
        
    } catch (error) {
        console.log(`Error is at adding to cart ${error}`)
    }


})
router.get('/remove/:id', async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.session.currentUserId;

        const cartdelete=await Cart.findOneAndUpdate({userId:userId},{$pull:{products:{productId:id}}})
        if(cartdelete){
            await product.findByIdAndUpdate(id,{$set:{cart:false}})
            notifier.notify({
                title: 'Notifications',
                message: 'The Cart Item removed ',
                icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                wait: true
            })
            res.redirect('/carts')
        }else{
            res.send('An Error')
        }
    } catch (error) {
        console.log('The Error is at Remove from cart.' + error)
    }
})

module.exports = router