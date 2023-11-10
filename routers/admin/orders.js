const express = require('express')
const router = express.Router()
const Order = require('../../models/order')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

router.get('/', async (req, res) => {
    const orderList = await Order.find()
    console.log('ordesr'+orderList)

    const order = await Order.aggregate([
        {
            $unwind: "$orders"
        },
        {
            $unwind: "$orders.products"
        }
    ]);
    const productsPerPage = 9
    const page = parseInt(req.query.page) || 1;
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = order.slice(start, end)


    res.render('admin/orders.ejs', {
        title: 'orders', order: paginatedProducts, currenPage: page,
        totaPages: Math.ceil(order.length / productsPerPage)
    })
})

router.get('/view_order/:id/:Tamount/:Pmethod/:aName/:aPhone/:date', async (req, res) => {
    const orderId = req.params.id
    const totalAmount = req.params.Tamount
    const paymentMethod = req.params.Pmethod
    const name = req.params.aName
    const phone = req.params.aPhone
    const date = req.params.date
    const order = await Order.findOne({ 'orders._id': orderId })
    if (order && order !== undefined && order !== null) {
        const products = await Order.aggregate([
            {
                $unwind: '$orders'
            },
            {
                $match: {
                    'orders._id': new ObjectId(orderId)
                }
            },
            {
                $unwind: '$orders.products'
            },
            {
                $project: {
                    _id: 0,
                    product: '$orders.products'
                }
            }
        ]);
        const productsPerPage = 3;
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage; 
        const end = start + productsPerPage;
        const paginatedProducts = products.slice(start, end)
        console.log(products[0].product);
        return res.json({success:true,
            products: paginatedProducts,
            currenPage: page,
            id: orderId,
            totaPages: Math.ceil(products.length / productsPerPage), totalAmount, paymentMethod, name, phone, date
        }) 
    
}
})

module.exports = router