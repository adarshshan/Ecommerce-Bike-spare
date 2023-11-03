const Cart = require('../models/cart')
const Order = require('../models/order')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;



function paymentOptionPage (req, res) {
    try {
        const id = req.params.id
        const name = req.params.name
        const phone = req.params.phone
        // console.log('Id received at backend ' + id)
        req.session.selectedAddress = {
            id: id,
            name: name,
            phone: phone
        }
        if (req.session.selectedAddress) {
            res.render('user/paymentOption.ejs', { title: 'payment', result: 'success' })
        }
    } catch (error) {
        console.log('Error is at /payment_option/:id ' + error)
    }
}

async function orderPost(req, res) {
    try {
        const value = req.params.value
        const { id, name, phone } = req.session.selectedAddress
        console.log(`id :${id}, name :${name}, phone : ${phone}`)
        const addressId = new ObjectId(id)
        const user = req.session.currentUserId
        const userId = new ObjectId(user);
        let status = value === 'COD' ? 'PLACED' : 'PENDING'
        const cart = await Cart.findOne({ userId: userId })
        const exist = await Order.findOne({ userId: userId })

        if (exist && exist !== null) {
            try {
                console.log('already have an order collection...')
                if (cart && cart !== null) {
                    let items = []
                    const { totalAmount, totalProducts } = await calculateTotalAmount({ userId: userId })
                    const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                    if (products) {
                        console.log(`your products is ${products}`)
                        for (let i = 0; i < products.products.length; i++) {
                            let data = {
                                product_id: products.products[i].productId,
                                productName: products.products[i].productName,
                                productPrice: products.products[i].productPrice,
                                productImage: products.products[i].productImage,
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

                    const orderOk = await Order.findOneAndUpdate({ userId: user }, {
                        $push: {
                            orders: [{
                                paymentMethod: value,
                                totalAmount: totalAmount,
                                products: items,
                                address: [{
                                    addressId: addressId,
                                    addressName: name,
                                    addressPhone: phone
                                }],

                            }]
                        }
                    })
                    if (orderOk) {
                        console.log('order success pushed successfully into the existing order model..')
                        const deleted = await Cart.findOneAndDelete({ userId: user })
                        if (deleted) {
                            console.log('The cart is no more....')
                        } else {
                            console.log('somthing trouble while deleting the cart')
                        }
                        delete req.session.selectedAddress
                        return res.json({ success: true, message: 'order placed successfully...' })
                        // return res.redirect('/carts/orders')
                    } else {
                        console.log('somthing trouble while push the orders into the ordermodel..')
                        return res.json({ success: false, message: 'somthing trouble while push the orders into the ordermodel..' })
                    }

                } else {
                    console.log(`don't have any carts`);
                }
            } catch (error) {
                console.log(error)
            }

        } else {
            try {
                console.log('new in orderlist...')
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
                                productName: products.products[i].productName,
                                productPrice: products.products[i].productPrice,
                                productImage: products.products[i].productImage,
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
                        userId: user,
                        orders: [{
                            paymentMethod: value,
                            totalAmount: totalAmount,
                            products: items,
                            address: [{
                                addressId: addressId,
                                addressName: name,
                                addressPhone: phone
                            }],

                        }]
                    })
                    if (orderOk) {
                        console.log('Order placed successfully')
                        delete req.session.selectedAddress
                        const deleted = await Cart.findOneAndDelete({ userId: user })
                        if (deleted) {
                            console.log('The cart is no more....')
                        } else {
                            console.log('somthing trouble while deleting the cart')
                        }
                        return res.json({ success: true, message: 'success part' })
                        // return res.redirect('/carts/orders')
                    } else {
                        console.log('Order FAiled at "OrderOk"')
                        return res.json({ success: false, message: 'Order Failed!' })
                    }

                } else {
                    console.log('cart is Empty!')
                }

            } catch (error) {
                console.log(error)
            }

        }
    } catch (error) {
        console.log('An error occured at /order  post ' + error)
    }
}

async function orderHomePage(req, res) {
    try {
        const user = req.session.currentUserId
        console.log(`user id is ${user}`)
        const userId = new ObjectId(user)
        const data = await Order.findOne({ userId: user }).sort({'orders.date':-1})
        data.orders.sort((a, b) => b.date - a.date);
        if (data && data !== null && data !== undefined) {
            console.log(data)
            return res.render('user/orderlist.ejs', { title: 'orderList', data });
        } else {
            res.send('data not found...')
            console.log('data not found...')
        }

    } catch (error) {
        console.log('somthing went wrong at /orders  get')
        console.log(error)
    }
}

async function viewOrder(req, res) {
    try {
        console.log(req.params.id)
        const orderId = req.params.id
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
            console.log(products);
            return res.render('user/viewOrderedProducts.ejs',{products})
            // res.send(products)
        }
    } catch (error) {
        console.log(error)
    }
}

async function cancelOrder(req,res){
    try {
        const orderId=req.params.id
        const cancel=await Order.findOneAndUpdate({'orders._id':orderId},{$set:{'orders.$.isCancelled':true}})
        if(cancel){
            console.log(cancel)
            // await Order.findOneAndUpdate({'orders._id':orderId},{$set:{'orders.$.products.$.status':'Cancelled'}})
            console.log('Order cancelled');
            res.redirect('/carts/orders/')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports={
    paymentOptionPage,
    orderPost,
    orderHomePage,
    viewOrder,
    cancelOrder
}


// additional functons

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