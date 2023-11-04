const express = require('express')
const router = express.Router()
const Order = require('../../models/order')

router.get('/', async (req, res) => {
    const orderList = await Order.find()
    const order = await Order.aggregate([
        {
            $unwind: "$orders"
        },
        {
            $unwind: "$orders.products"
        }
    ]);
    // console.log(order)


    // console.log(order)
    res.render('admin/orders.ejs', { title: 'orders',order })
})

module.exports = router