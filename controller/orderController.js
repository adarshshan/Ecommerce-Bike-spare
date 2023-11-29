const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const Coupon = require('../models/coupon')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const Promise = require('promise')
const Swal = require('sweetalert2')
const helpers = require('../utils/helpers')
const localStorage = require("localStorage")




async function paymentOptionPage(req, res) {
    try {
        const id = req.params.id
        const name = req.params.name
        const phone = req.params.phone
        const userId = req.session.currentUserId
        const user = new ObjectId(userId)
        req.session.selectedAddress = {
            id: id,
            name: name,
            phone: phone
        }
        if (localStorage.getItem("product")) {
            console.log('Buy Now')
            let product = JSON.parse(localStorage.getItem("product"));
            console.log(product)
            const totalDiscount = product.price * product.discount / 100;
            const totalAmount = product.price - totalDiscount;
            const totalProducts = 1;
            return res.render('user/paymentOption.ejs', { title: 'payment', result: 'success', totalAmount, totalProducts, totalDiscount })
        }
        if (req.session.selectedAddress) {
            const { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: user })
            res.render('user/paymentOption.ejs', { title: 'payment', result: 'success', totalAmount, totalProducts, totalDiscount })
        }
    } catch (error) {
        console.log('Error is at /payment_option/:id ' + error)
    }
}

async function orderPost(req, res) {
    try {
        const value = req.params.value
        const { id, name, phone } = req.session.selectedAddress
        const addressId = new ObjectId(id)
        const user = req.session.currentUserId
        const userId = new ObjectId(user);
        let status = value === 'COD' ? 'PLACED' : 'PENDING'
        const cart = await Cart.findOne({ userId: userId })
        const exist = await Order.findOne({ userId: userId })
        const invoiceNumber = helpers.generateInvoiceNumber();
        const userData = await User.findById(user)
        const userName = userData.name
        const userEmail = userData.email
        const userPhone = userData.phone
        const date = Date.now()
        const coupon = req.session.discount;

        if (exist && exist !== null) {
            try {
                console.log('already have an order collection...')
                //----buy now----//
                if (localStorage.getItem("product")) {
                    let product = JSON.parse(localStorage.getItem("product"));
                    var totalDiscount = product.price * product.discount / 100;
                    var totalAmount = product.price - totalDiscount;
                    var totalProducts = 1;
                    //coupon///
                    var discount = 0;
                    var couponCode
                    var couponPercent = 0
                    if (coupon && coupon !== null && coupon !== undefined) {
                        console.log('Coupon Detected')
                        totalAmount = coupon.total
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    }
                    if (value === 'online payment + wallet') {
                        const userDetails = await User.findById(user)
                        if (!userDetails.wallet.balance) return res.json({ success: false, message: 'Wallet is Empty!' })
                        if (userDetails.wallet.balance == 0) return res.json({ success: false, message: 'Wallet is Empty!!' })
                        if (userDetails.wallet.balance < totalAmount) {
                            var totalAmount = totalAmount - userDetails.wallet.balance;
                            var wallet = userDetails.wallet.balance
                        } else {
                            var wallet = totalAmount;
                            var totalAmount = 0;
                        }
                    }
                    let items = [{
                        product_id: product.id,
                        productName: product.name,
                        productPrice: product.price,
                        productImage: product.imageUri,
                        productDiscription: product.discription,
                        quantity: 1,
                        status: status,
                    }]

                    const invoiceData = helpers.getSampleData(invoiceNumber, items, name, phone, userName, userPhone, userEmail, value, date, discount, totalAmount, wallet, totalDiscount, couponPercent)

                    const orderOk = await Order.findOneAndUpdate({ userId: user }, {
                        $push: {
                            orders: {
                                $each: [{
                                    paymentMethod: value,
                                    invoice: invoiceNumber,
                                    totalAmount: totalAmount,
                                    couponDiscount: discount,
                                    ProductDiscount: totalDiscount,
                                    walletAmount: wallet,
                                    products: items,
                                    address: {
                                        addressId: addressId,
                                        addressName: name,
                                        addressPhone: phone
                                    },

                                }], $position: 0
                            }
                        }
                    })
                    if (orderOk) {
                        console.log('order success pushed successfully into the existing order model..')

                        //Stock Deduction
                        await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });

                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id).then((result) => {

                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));

                                return res.json({ online: true, message: 'Online Payment...', invoiceData: invoiceData, result });
                            }).catch((err) => {
                                console.log(`error is ${err}`);
                            })
                        }
                    } else {
                        console.log('somthing trouble while push the orders into the ordermodel..')
                        return res.json({ success: false, message: 'somthing trouble while push the orders into the ordermodel..', invoiceData: '' })
                    }

                }
                //-----/buy Now------//
                //coupon///
                if (cart && cart !== null) {
                    let items = []
                    var totalAmount;
                    var discount = 0;
                    var couponCode
                    var totalDiscount = 0
                    var couponPercent = 0
                    var { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: userId })
                    if (coupon && coupon !== null && coupon !== undefined) {
                        console.log('Coupon Detected')
                        totalAmount = coupon.total
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    }

                    const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                    if (products) {
                        for (let i = 0; i < products.products.length; i++) {
                            let data = {
                                product_id: products.products[i].productId,
                                productName: products.products[i].productName,
                                productPrice: products.products[i].productPrice,
                                productImage: products.products[i].productImage,
                                productDiscription: products.products[i].discription,
                                quantity: products.products[i].quantity,
                                status: status,
                            }
                            items.push(data)
                        }
                        console.log('products added to orders...')
                    } else {
                        console.log('products not found in database...')
                    }

                    if (value === 'online payment + wallet') {
                        console.log('Its online payment + wallet methodd')
                        const userDetails = await User.findById(user)
                        if (!userDetails.wallet.balance) return res.json({ success: false, message: 'Wallet is Empty!' })
                        if (userDetails.wallet.balance == 0) return res.json({ success: false, message: 'Wallet is Empty!!' })
                        if (userDetails.wallet.balance < totalAmount) {
                            var totalAmount = totalAmount - userDetails.wallet.balance;
                            var wallet = userDetails.wallet.balance
                        } else {
                            var wallet = totalAmount;
                            var totalAmount = 0;
                        }
                    }

                    const invoiceData = helpers.getSampleData(invoiceNumber, items, name, phone, userName, userPhone, userEmail, value, date, discount, totalAmount, wallet, totalDiscount, couponPercent)

                    const orderOk = await Order.findOneAndUpdate({ userId: user }, {
                        $push: {
                            orders: {
                                $each: [{
                                    paymentMethod: value,
                                    invoice: invoiceNumber,
                                    totalAmount: totalAmount,
                                    couponDiscount: discount,
                                    ProductDiscount: totalDiscount,
                                    walletAmount: wallet,
                                    products: items,
                                    address: {
                                        addressId: addressId,
                                        addressName: name,
                                        addressPhone: phone
                                    },

                                }], $position: 0
                            }
                        }
                    })
                    if (orderOk) {
                        console.log('order success pushed successfully into the existing order model..')

                        //Stock Deduction
                        for (let i = 0; i < products.products.length; i++) {
                            let proid = products.products[i].productId
                            let qty = products.products[i].quantity
                            await Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } });
                        }
                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            delete req.session.discount;//To delete the coupon discount details.
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                delete req.session.discount;//To delete the coupon discount details.
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id).then((result) => {
                                Cart.findOneAndDelete({ userId: user }).then(() => console.log('Deleted the existing cart from online payment'));
                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                delete req.session.discount;//To delete the coupon discount details.
                                return res.json({ online: true, message: 'Online Payment...', invoiceData: invoiceData, result });
                            }).catch((err) => {
                                console.log(`error is ${err}`);
                            })
                        }
                    } else {
                        console.log('somthing trouble while push the orders into the ordermodel..')
                        return res.json({ success: false, message: 'somthing trouble while push the orders into the ordermodel..', invoiceData: '' })
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
                //----buy now----//
                if (localStorage.getItem("product")) {
                    console.log('Buy Now')
                    let product = JSON.parse(localStorage.getItem("product"));
                    console.log(product)
                    var totalDiscount = product.price * product.discount / 100;
                    var totalAmount = product.price - totalDiscount;
                    var totalProducts = 1;
                    //coupon///
                    var discount = 0;
                    var couponCode
                    var couponPercent = 0
                    if (coupon && coupon !== null && coupon !== undefined) {
                        console.log('Coupon Detected')
                        totalAmount = coupon.total
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    }
                    if (value === 'online payment + wallet') {
                        console.log('Its online payment + wallet methodd')
                        const userDetails = await User.findById(user)
                        if (!userDetails.wallet.balance) return res.json({ success: false, message: 'Wallet is Empty!' })
                        if (userDetails.wallet.balance == 0) return res.json({ success: false, message: 'Wallet is Empty!!' })
                        if (userDetails.wallet.balance < totalAmount) {
                            var totalAmount = totalAmount - userDetails.wallet.balance;
                            var wallet = userDetails.wallet.balance
                        } else {
                            var wallet = totalAmount;
                            var totalAmount = 0;
                        }
                    }
                    let items = [{
                        product_id: product.id,
                        productName: product.name,
                        productPrice: product.price,
                        productImage: product.imageUri,
                        productDiscription: product.discription,
                        quantity: 1,
                        status: status,
                    }]

                    const invoiceData = helpers.getSampleData(invoiceNumber, items, name, phone, userName, userPhone, userEmail, value, date, discount, totalAmount, wallet, totalDiscount, couponPercent)
                    const orderOk = await Order.insertMany({
                        userId: user,
                        orders: [{
                            paymentMethod: value,
                            invoice: invoiceNumber,
                            totalAmount: totalAmount,
                            couponDiscount: discount,
                            ProductDiscount: totalDiscount,
                            products: items,
                            address: {
                                addressId: addressId,
                                addressName: name,
                                addressPhone: phone
                            },

                        }]
                    })
                    if (orderOk) {
                        console.log('order success pushed successfully into the existing order model..')

                        //Stock Deduction
                        await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });

                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id).then((result) => {

                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));

                                return res.json({ online: true, message: 'Online Payment...', invoiceData: invoiceData, result });
                            }).catch((err) => {
                                console.log(`error is ${err}`);
                            })
                        }
                    } else {
                        console.log('somthing trouble while push the orders into the ordermodel..')
                        return res.json({ success: false, message: 'somthing trouble while push the orders into the ordermodel..', invoiceData: '' })
                    }

                }
                //-----/buy Now------//
                if (cart && cart !== null) {
                    let items = []
                    var totalAmount;
                    var discount = 0;
                    var couponCode;
                    var totalDiscount = 0
                    var couponPercent = 0;
                    var { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: userId })
                    if (coupon && coupon !== null && coupon !== undefined) {
                        console.log('Coupon Detected')
                        totalAmount = coupon.total
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    } else {
                        console.log('There is no coupon')
                    }
                    const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                    if (products) {
                        for (let i = 0; i < products.products.length; i++) {
                            let data = {
                                product_id: products.products[i].productId,
                                productName: products.products[i].productName,
                                productPrice: products.products[i].productPrice,
                                productImage: products.products[i].productImage,
                                productDiscription: products.products[i].discription,
                                quantity: products.products[i].quantity,
                                status: status,
                            }
                            items.push(data)
                        }

                    } else {
                        console.log('products not found in database...')
                    }
                    const invoiceData = helpers.getSampleData(invoiceNumber, items, name, phone, userName, userPhone, userEmail, value, date, discount, totalAmount, totalDiscount, couponPercent)
                    const orderOk = await Order.insertMany({
                        userId: user,
                        orders: [{
                            paymentMethod: value,
                            invoice: invoiceNumber,
                            totalAmount: totalAmount,
                            couponDiscount: discount,
                            ProductDiscount: totalDiscount,
                            products: items,
                            address: {
                                addressId: addressId,
                                addressName: name,
                                addressPhone: phone
                            },

                        }]
                    })
                    if (orderOk) {
                        console.log('Order placed successfully')

                        //Stock Deduction
                        for (let i = 0; i < products.products.length; i++) {
                            let proid = products.products[i].productId
                            let qty = products.products[i].quantity
                            await Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } });
                        }

                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        if (value === 'COD') {
                            await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            return res.json({ success: true, message: 'success part', invoiceData: invoiceData })
                        } else {
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id).then((result) => {
                                Cart.findOneAndDelete({ userId: user }).then(() => console.log('Deleted the existing cart from online payment'));
                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                return res.json({ online: true, message: 'Online Payment...', invoiceData: invoiceData, result });
                            }).catch((err) => {
                                console.log(`error is ${err}`);
                            })
                        }

                    } else {
                        console.log('Order FAiled at "OrderOk"')
                        return res.json({ success: false, message: 'Order Failed!', invoiceData: '' })
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
        const productsPerPage = 6;
        const user = req.session.currentUserId
        console.log(`user id is ${user}`)
        const userId = new ObjectId(user)
        const data = await Order.findOne({ userId: user })

        if (data && data !== null && data !== undefined) {
            //pagination
            const page = parseInt(req.query.page) || 1;
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const paginatedProducts = data.orders.slice(start, end)

            return res.render('user/orderlist.ejs', {
                title: 'orderList',
                data: paginatedProducts,
                currenPage: page,
                totaPages: Math.ceil(data.orders.length / productsPerPage)
            });
        } else {
            res.send('NO orders')
            console.log('data not found...')
        }

    } catch (error) {
        console.log('somthing went wrong at /orders  get')
        console.log(error)
    }
}

async function viewOrder(req, res) {
    try {
        const orderId = req.params.id
        const totalAmount = req.params.Tamount
        const paymentMethod = req.params.Pmethod
        const name = req.params.aName
        const phone = req.params.aPhone
        const date = req.params.date
        const invoice = req.params.invoice
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
            return res.render('user/viewOrderedProducts.ejs', {
                products: paginatedProducts,
                currenPage: page,
                id: orderId,
                totaPages: Math.ceil(products.length / productsPerPage), totalAmount, paymentMethod, name, phone, date, invoice
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function cancelOrder(req, res) {
    try {
        const orderId = req.params.id
        const userId = req.session.currentUserId;
        const orderElem = await Order.findOne({ userId: userId }, { orders: { $elemMatch: { _id: orderId } } })
        const status = orderElem.orders[0].products[0].status;
        await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.isCancelled': true } })
        const cancel = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': 'CANCELLED' } })
        if (cancel) {
            if (orderElem.orders[0].paymentMethod !== 'COD' && status === 'PLACED') {
                await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.refund': true } })
            }
            console.log('Order cancelled');
            return res.json({ success: true, message: 'Order cancelled!' })
            // res.redirect('/carts/orders/')
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Failed to cancel!' })
    }
}

async function changeStatus(req, res) {
    try {
        const orderId = req.params.id
        const status = req.params.status
        if (status == 'DELIVERED') {
            const expireDate = new Date().setDate(new Date().getDate() + 15)
            await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.return_last_date': expireDate } })
        }
        const updated = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': status } })
        if (updated) {
            console.log('status updated')
            return res.json({ success: true, message: 'Status updated' })
        } else {
            console.log('Status failed to update')
            return res.json({ success: false, message: 'Status failed to update' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' })
    }
}

function verifyPayment(req, res) {
    const { payment, order } = req.body
    helpers.veryfyPayment(payment, order).then(() => {
        helpers.removeCart(req.session.currentUserId, req);//to delete the existing cart details
        helpers.changePaymentStatu(order.receipt).then(() => {
            console.log('payment successful');
            res.json({ status: true, message: 'payment successful and status changed!.' });
        }).catch((err) => {
            console.log(err)
            console.log('payment failed and status not updated.')
            res.json({ status: false, message: 'payment failed and status not updated.' });
        })
    }).catch((err) => {
        console.log(err)

        res.json({ status: false, message: 'Somthing went wrong' })
    })
}

async function returnProduct(req, res) {
    try {
        const orderId = req.params.id;
        const Return = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': 'RETURN' } })
        if (Return) {
            await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.refund': true } })
            console.log('product return approved.')
            return res.json({ success: true, message: 'product return approved.' })
        } else {
            console.log('product return Failed.')
            return res.json({ success: false, message: 'product return Failed.' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Somthing went wrong.' })
    }
}

async function adminOrderList(req, res) {
    try {
        const orderList = await Order.find()
        const allOrders = orderList.reduce((accumulator, currentOrder) => {
            return accumulator.concat(currentOrder.orders);
        }, []);
        allOrders.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

        // orderList[0].orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        // let order = orderList[0].orders
        const productsPerPage = 9
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = allOrders.slice(start, end)
        res.render('admin/orders.ejs', {
            title: 'orders', order: paginatedProducts, currenPage: page,
            totaPages: Math.ceil(allOrders.length / productsPerPage)
        })
    } catch (error) {
        console.log(error)
    }
}

async function adminViewOrder(req, res) {
    try {
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

            return res.json({
                success: true,
                products: products,
                id: orderId,
                totalAmount,
                paymentMethod, name, phone, date
            })

        } else {
            console.log('Couldn`t find the details.')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    paymentOptionPage,
    orderPost,
    orderHomePage,
    viewOrder,
    cancelOrder,
    changeStatus,
    adminOrderList,
    adminViewOrder,
    verifyPayment,
    returnProduct
}


// additional functons





