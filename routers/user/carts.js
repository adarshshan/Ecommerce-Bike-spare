const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')
const notifier = require('node-notifier');
const path = require('path')
const controller = require('../../controller/cartController')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/', controller.cartHome)

router.post('/add/:id', controller.addCart)

router.get('/remove/:id', controller.removeCart)

router.get('/increaseCount/:id', async (req, res) => {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const cartId = req.session.cartId
        if (userId) {
            await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': 1 } })
            const q = await Cart.aggregate([
                {
                    $match: {
                        "products.productId": id
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $match: {
                        "products.productId": id
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field from the result
                        quantity: "$products.quantity"
                    }
                }
            ])
            let productQuantity = q[0].quantity
            console.log(`Quantity: ${productQuantity}`);
            res.json({ success: true, productQuantity })

        } else if (cartId) {
            await Cart.updateOne({ _id: cartId, 'products.productId': id }, { $inc: { 'products.$.quantity': 1 } })
            const q = await Cart.aggregate([
                {
                    $match: {
                        "products.productId": id
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $match: {
                        "products.productId": id
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field from the result
                        quantity: "$products.quantity"
                    }
                }
            ])
            let productQuantity = q[0].quantity
            console.log(`Quantity: ${productQuantity}`);
            res.json({ success: true, productQuantity })
        } else {
            console.log('Something went wrong...')
            res.json({ success: false })
        }
    } catch (error) {
        console.log(`An error occured while increasing the Quantity...${error}`)
    }
})
router.get('/decreaseCount/:id', async (req, res) => {
    const idd = req.params.id
    const id = new ObjectId(idd)
    const userId = req.session.currentUserId
    const cartId = req.session.cartId
    if (userId) {
        await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': -1 } })
        const q = await Cart.aggregate([
            {
                $match: {
                    "products.productId": id
                }
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.productId": id
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    quantity: "$products.quantity"
                }
            }
        ])
        let productQuantity = q[0].quantity
        console.log(`Quantity: ${productQuantity}`);
        res.json({ success: true, productQuantity })
    } else if (cartId) {
        await Cart.updateOne({ _id: cartId, 'products.productId': id }, { $inc: { 'products.$.quantity': -1 } })
        const q = await Cart.aggregate([
            {
                $match: {
                    "products.productId": id
                }
            },
            {
                $unwind: "$products"
            },
            {
                $match: {
                    "products.productId": id
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    quantity: "$products.quantity"
                }
            }
        ])
        let productQuantity = q[0].quantity
        console.log(`Quantity: ${productQuantity}`);
        res.json({ success: true, productQuantity })
    }
})

module.exports = router