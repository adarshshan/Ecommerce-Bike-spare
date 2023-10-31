const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')
const Order = require('../../models/order')
const notifier = require('node-notifier');
const path = require('path')
const controller = require('../../controller/cartController')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

router.get('/', controller.cartHome)

router.post('/add/:id', controller.addCart)

router.get('/remove/:id', controller.removeCart)

router.get('/increaseCount/:id', controller.increaseCount)

router.get('/decreaseCount/:id', controller.decreaseCount)


// payment options......

router.get('/payment_option/:id', (req, res) => {
    try {
        const id = req.params.id
        // console.log('Id received at backend ' + id)
        req.session.selectedAddress = id;
        if (req.session.selectedAddress) {
            res.render('user/paymentOption.ejs', { title: 'payment', result: 'success' })
        }
    } catch (error) {
        console.log('Error is at /payment_option/:id ' + error)
    }
})
router.post('/orders/:value', async (req, res) => {
    try {
        const value = req.params.value
        const addressId = req.session.selectedAddress
        const user = req.session.currentUserId
        const userId = new ObjectId(user);
        let status = value === 'COD' ? 'PLACED' : 'PENDING'
        const cart = await Cart.findOne({ userId: userId })
        const exist = await Order.findOne({ userId: userId })
        
        if (exist && exist !== null) {
            console.log('already have an order collection...')
            if (cart && cart !== null) {
                let items = []
                const { totalAmount, totalProducts } = await calculateTotalAmount({ userId: userId })
                const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                if (products) {
                    console.log(`your products is ${products}`)
                    console.log(products.products.length)
                    for (let i = 0; i < products.products.length; i++) {
                        let data = {
                            product_id: products.products[i].productId,
                            quantity: products.products[i].quantity,
                            status: status,
                        }
                        console.log(`index${i} and data is ${data}`)
                        items.push(data)
                    }
                    console.log('your Items is ' + items)
                    console.log(items)
                    console.log('products added to orders...')
                } else {
                    console.log('products not found in database...')
                }

                const orderOk = await Order.findOneAndUpdate({userId:user},{$push:{orders:[{
                    paymentMethod: value,
                    totalAmount: totalAmount,
                    products: items,
                    address: addressId,

                }]}})
                if(orderOk){
                    console.log('order success pushed successfully into the existing order model..')
                    const deleted=await Cart.findOneAndDelete({userId:user})
                    if(deleted){
                        console.log('The cart is no more....')
                    }else{
                        console.log('somthing trouble while deleting the cart')
                    }
                    return res.json({message:'order placed successfully...'})
                }else{
                    console.log('somthing trouble while push the orders into the ordermodel..')
                }

            }else{
                console.log(`don't have any carts`);
            }
        }else{
            console.log('new in orderlist...')
            if (cart && cart !== null) {
                let items=[]
                const { totalAmount, totalProducts } = await calculateTotalAmount({ userId: userId })
                const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                if (products) {
                    console.log(`your products is ${products}`)
                    console.log(products.products.length)
                    for (let i = 0; i < products.products.length; i++) {
                        let data = {
                            product_id: products.products[i].productId,
                            quantity: products.products[i].quantity,
                            status: status,
                        }
                        items.push(data)
                    }
                    console.log('your Items is ' + items)
                    console.log(items)
                } else {
                    console.log('products not found in database...')
                }

                const orderOk = await Order.insertMany({
                    userId: userId,
                    orders: [{
                        paymentMethod: value,
                        totalAmount: totalAmount,
                        products: items,
                        address: addressId,

                    }]
                })
                if (orderOk) {
                    console.log('Order placed successfully')
                    const deleted=await Cart.findOneAndDelete({userId:user})
                    if(deleted){
                        console.log('The cart is no more....')
                    }else{
                        console.log('somthing trouble while deleting the cart')
                    }
                }
                return res.json({ message: 'success part' })
            } else {
                console.log('no products in your cart.')
            }
        }
    } catch (error) {
        console.log('An error occured at /order  post ' + error)
    }
})

const calculateTotalAmount = async (matchCriteria) => {
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
                totalAmount: { $sum: { $multiply: ["$product.price", "$products.quantity"] } },
                totalProducts: { $sum: 1 }
            }
        }
    ]);

    console.log('Aggregation result:', result);

    if (result.length > 0) {
        console.log('Total Amount:', result[0].totalAmount);
        let totalAmount = result[0].totalAmount
        let totalProducts = result[0].totalProducts
        return { totalAmount, totalProducts };
    } else {
        console.log('No results found.');
        return 0; // Return 0 if no results
    }
};



module.exports = router