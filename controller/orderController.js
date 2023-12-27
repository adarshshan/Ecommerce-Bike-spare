const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const Coupon = require('../models/coupon')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const Promise = require('promise')
const helpers = require('../utils/helpers')
const localStorage = require("localStorage")




async function paymentOptionPage(req, res) {
    try {
        const id = req.params.id
        const name = req.params.name
        const phone = req.params.phone
        const userId = req.session.currentUserId
        const user = new ObjectId(userId)
        const usedcoupons = await User.findOne({ _id: userId }, { _id: 0, usedCoupons: 1 });
        console.log(`used coupons are....................${usedcoupons}`);
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
            const totalAmount = product.price;
            const totalProducts = 1;
            //awailable coupons
            const currentDate = new Date().toISOString().split('T')[0];
            const couponlist = await Coupon.find({ isActive: true, isDeleted: false, minPurchase: { $lt: totalAmount }, expireDate: { $gt: currentDate } })
            console.log('result is .............................................')
            console.log(couponlist.length)
            const available = couponlist.filter(item => item.maxusage > item.used_count);
            const SuitableCoupon = helpers.suitableCoupon(available, usedcoupons);
            return res.render('user/paymentOption.ejs', { title: 'payment', result: 'success', totalAmount, totalProducts, totalDiscount, coupon: SuitableCoupon })
        }
        if (req.session.selectedAddress) {
            // const { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: user })
            const cart = await helpers.cartItems(user);
            const totalAmount = cart.reduce((total, product) => total + (product.price * product.quantityInCarts), 0);
            const totalDiscount = cart.reduce((total, product) => total + (product.quantityInCarts * ((product.price * product.discount) / 100)), 0);
            const totalProducts = cart.length;
            //awailable coupons
            const currentDate = new Date().toISOString().split('T')[0];
            const couponlist = await Coupon.find({ isActive: true, isDeleted: false, minPurchase: { $lt: totalAmount }, expireDate: { $gt: currentDate } })
            console.log('result is .............................................')
            console.log(couponlist.length)
            const available = couponlist.filter(item => item.maxusage > item.used_count);
            const SuitableCoupon = helpers.suitableCoupon(available, usedcoupons);
            res.render('user/paymentOption.ejs', { title: 'payment', result: 'success', totalAmount, totalProducts, totalDiscount, coupon: SuitableCoupon })
        }
    } catch (error) {
        console.log('Error is at /payment_option/:id ' + error)
        console.log(error)
        return res.redirect('/err-internal');
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
                        totalAmount = parseInt(coupon.total)
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




                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });//Stock Deduction
                            if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                            delete req.session.discount;//To delete the coupon discount details.
                            localStorage.removeItem('product');
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });//Stock Deduction
                                if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                                delete req.session.discount;//To delete the coupon discount details.
                                localStorage.removeItem('product');
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id, res).then((result) => {
                                Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } }).then(() => console.log('Stock deducted'))
                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                if (couponCode) User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true }).then(() => console.log(''));//add used coupon in user collection.
                                delete req.session.discount;//To delete the coupon discount details.
                                localStorage.removeItem('product');
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
                    const cartItem = await helpers.cartItems(userId);
                    let items = []
                    var totalAmount;
                    var discount = 0;
                    var couponCode
                    var totalDiscount = 0
                    var couponPercent = 0
                    // var { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: userId })
                    totalAmount = cartItem.reduce((total, product) => total + (product.price * product.quantityInCarts), 0);
                    totalDiscount = cartItem.reduce((total, product) => total + (product.quantityInCarts * ((product.price * product.discount) / 100)), 0);
                    var totalProducts = cart.length;
                    if (coupon && coupon !== null && coupon !== undefined) {
                        console.log('Coupon Detected')
                        totalAmount = parseInt(coupon.total)
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    }

                    // const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                    if (cart) {
                        for (let i = 0; i < cartItem.length; i++) {
                            let data = {
                                product_id: cartItem[i]._id,
                                productName: cartItem[i].name,
                                productPrice: cartItem[i].price,
                                productImage: cartItem[i].image[0],
                                productDiscription: cartItem[i].description,
                                quantity: cartItem[i].quantityInCarts,
                                status: status,
                            }
                            items.push(data)
                        }
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


                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                            delete req.session.discount;//To delete the coupon discount details.
                            //Stock Deduction
                            for (let i = 0; i < cartItem.length; i++) {
                                let proid = cartItem[i]._id
                                let qty = cartItem[i].quantityInCarts
                                await Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } });
                            }
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                                delete req.session.discount;//To delete the coupon discount details.
                                //Stock Deduction
                                for (let i = 0; i < cartItem.length; i++) {
                                    let proid = cartItem[i]._id
                                    let qty = cartItem[i].quantityInCarts
                                    await Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } });
                                }
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount - totalDiscount, orderElem.orders[0]._id, res).then((result) => {
                                Cart.findOneAndDelete({ userId: user }).then(() => console.log('Deleted the existing cart from online payment'));
                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                if (couponCode) User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true }).then(() => console.log(''));//add used coupon in user collection.
                                delete req.session.discount;//To delete the coupon discount details.
                                //Stock Deduction
                                for (let i = 0; i < cartItem.length; i++) {
                                    let proid = cartItem[i]._id
                                    let qty = cartItem[i].quantityInCarts
                                    Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } }).then(() => console.log(''))
                                }
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
                        totalAmount = parseInt(coupon.total);
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

                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        console.log(`orderElement is ${orderElem}`);
                        if (value === 'COD') {
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });//Stock Deduction
                            delete req.session.discount;//To delete the coupon discount details.
                            if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                            localStorage.removeItem('product');
                            return res.json({ success: true, message: 'order placed successfully...', invoiceData: invoiceData })
                        } else {
                            if (totalAmount === 0 && value === 'online payment + wallet') {
                                await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                                console.log('order placed using wallet balance')
                                helpers.changePaymentStatus(invoiceNumber)
                                helpers.decreaseWalletBalance(user, wallet);
                                await Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } });//Stock Deduction
                                delete req.session.discount;//To delete the coupon discount details.
                                if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                                localStorage.removeItem('product');
                                return res.json({ success: true, message: 'order placed successfully...(Using the wallet balance', invoiceData: invoiceData })
                            }
                            if (value === 'online payment + wallet') helpers.decreaseWalletBalance(user, wallet);
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id, res).then((result) => {

                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                Product.findByIdAndUpdate(product.id, { $inc: { stock: -1 } }).then(() => { console.log('') })//Stock Deduction
                                delete req.session.discount;//To delete the coupon discount details.
                                if (couponCode) User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true }).then(() => console.log(''));//add used coupon in user collection.
                                localStorage.removeItem('product');
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
                        totalAmount = parseInt(coupon.total);
                        discount = coupon.discount
                        couponCode = coupon.code
                        couponPercent = coupon.couponPercent
                    } else {
                        console.log('There is no coupon')
                    }
                    const products = await Cart.findOne({ userId: user }, { _id: 0, products: 1 })
                    const cartItem = await helpers.cartItems(userId);
                    if (products) {
                        for (let i = 0; i < cartItem.length; i++) {
                            let data = {
                                product_id: cartItem[i].productId,
                                productName: cartItem[i].productName,
                                productPrice: cartItem[i].productPrice,
                                productImage: cartItem[i].productImage,
                                productDiscription: cartItem[i].discription,
                                quantity: cartItem[i].quantity,
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



                        const orderElem = await Order.findOne({ userId: user }, { orders: { $elemMatch: { invoice: invoiceNumber } } })
                        if (value === 'COD') {
                            await Cart.findOneAndDelete({ userId: user })//to Delete the order completed cart
                            await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } })//to deduct the usage of coupon
                            //Stock Deduction
                            for (let i = 0; i < cartItem.length; i++) {
                                let proid = cartItem[i]._id
                                let qty = cartItem[i].quantityInCarts
                                await Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } });
                            }
                            delete req.session.discount;//To delete the coupon discount details.
                            if (couponCode) await User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true });//add used coupon in user collection.
                            return res.json({ success: true, message: 'success part', invoiceData: invoiceData })
                        } else {
                            helpers.generateRazorpay(totalAmount, orderElem.orders[0]._id, res).then((result) => {
                                Cart.findOneAndDelete({ userId: user }).then(() => console.log('Deleted the existing cart from online payment'));
                                Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { used_count: 1 } }).then(() => console.log('to deduct the usage of coupon from online payment.'));
                                //Stock Deduction
                                for (let i = 0; i < cartItem.length; i++) {
                                    let proid = cartItem[i]._id
                                    let qty = cartItem[i].quantityInCarts
                                    Product.findByIdAndUpdate(proid, { $inc: { stock: -qty } }).then(() => console.log(''))
                                }
                                delete req.session.discount;//To delete the coupon discount details.
                                if (couponCode) User.findByIdAndUpdate(user, { $push: { usedCoupons: { $each: [{ couponCode: couponCode }], $position: 0 } } }, { upsert: true, new: true }).then(() => console.log(''));//add used coupon in user collection.
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
        console.log(data)
        if (data && data !== null && data !== undefined) {
            //pagination
            const page = parseInt(req.query.page) || 1;
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const paginatedProducts = data.orders.slice(start, end)
            console.log('the orders are below.....................................................')
            // console.log(paginatedProducts);
            return res.render('user/orderlist.ejs', {
                title: 'orderList',
                data: paginatedProducts,
                currenPage: page,
                totaPages: Math.ceil(data.orders.length / productsPerPage)
            });
        } else {
            console.log('data not found...')
            return res.render('user/orderlist.ejs', {
                title: 'orderList',
                data: [],
                currenPage: 0,
                totalpages: 0
            })

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
            console.log(`orderr is`)
            console.log(order);
            const productsPerPage = 3;
            const page = parseInt(req.query.page) || 1;
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const paginatedProducts = products.slice(start, end)
            return res.render('user/viewOrderedProducts.ejs', {
                title: 'View-ordered-products',
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

async function buyNow(req, res) {
    try {
        const id = req.params.id//product id
        const name = req.params.name
        const price = req.params.price
        const imageUri = req.params.image
        const discription = req.params.disc;
        const discount = req.params.discount
        const userId = req.session.currentUserId
        const item = {
            id: id,
            name: name,
            price: price,
            imageUri: imageUri,
            discription: discription,
            discount: discount
        }
        localStorage.setItem('product', JSON.stringify(item))
        if (localStorage.getItem("product")) {
            res.json({ success: true, message: 'product Details successfully added to the localstorrage' })
        } else {
            res.json({ success: false, message: 'Failed to add product Details to localstorrage' })
        }


    } catch (error) {
        console.log(error)
    }
}

function reviewPage(req, res) {
    try {
        const productId = req.params.productid;
        const username = req.params.name;
        res.render('user/review.ejs', { title: 'Product-Review', productId, username });
    } catch (error) {
        console.log(error)
    }
}

async function postReview(req, res) {
    try {
        const { title, description, score, productId, username } = req.body;
        console.log(title, description, score, productId)
        const updateReview = await Product.findByIdAndUpdate(productId, {
            $push: {
                reviews: {
                    $each: [{
                        title: title,
                        description: description,
                        score: score,
                        reviewer: username
                    }],
                    $position: 0
                }
            }
        });
        if (updateReview) {
            return res.json({ success: true, message: 'Review completed' })
        } else {
            return res.json({ success: false, message: 'Failed to update the review.' });
        }
    } catch (error) {
        console.log(error)
    }
}
async function invoiceDetails (req, res) {
    try {
        const orderId = req.params.id;
        const orderElem = await Order.findOne({ orders: { $elemMatch: { _id: orderId } } },{_id:0,'orders.$':1})
        const selectedOrder=orderElem.orders[0];
        console.log(selectedOrder)
        return res.json({success:true,selectedOrder});
    } catch (error) {
        console.log(error)
    }
}

async function adminOrderList(req, res) {
    try {
        const orderList = await Order.find()
        const allOrders = orderList.reduce((accumulator, currentOrder) => {
            return accumulator.concat(currentOrder.orders);
        }, []);
        const newone = allOrders.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        console.log(`allorders are`)
        console.log(newone);
        res.render('admin/orders.ejs', { title: 'orders', order: newone })
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
    returnProduct,
    buyNow,
    reviewPage,
    postReview,
    invoiceDetails
}


// additional functons





