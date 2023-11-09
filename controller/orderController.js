const Cart = require('../models/cart')
const Order = require('../models/order')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const easyinvoice = require('easyinvoice');



async function paymentOptionPage(req, res) {
    try {
        const id = req.params.id
        const name = req.params.name
        const phone = req.params.phone
        const userId = req.session.currentUserId
        const user = new ObjectId(userId)
        // console.log('Id received at backend ' + id)
        req.session.selectedAddress = {
            id: id,
            name: name,
            phone: phone
        }
        if (req.session.selectedAddress) {
            const { totalAmount, totalProducts } = await calculateTotalAmount({ userId: user })
            res.render('user/paymentOption.ejs', { title: 'payment', result: 'success', totalAmount, totalProducts })
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
        const invoiceNumber = generateInvoiceNumber();
        console.log("Generated Invoice Number:", invoiceNumber);

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
                                productDiscription:products.products[i].discription,
                                quantity: products.products[i].quantity,
                                status: status,
                            }
                            items.push(data)
                        }
                        console.log(items)
                        console.log('products added to orders...')
                    } else {
                        console.log('products not found in database...')
                    }
                    const invoiceData = getSampleData(invoiceNumber, items, name, phone)
                    // const invoicePDF = await generateInvoicePDF(invoiceData);
                    const orderOk = await Order.findOneAndUpdate({ userId: user }, {
                        $push: {
                            orders: [{
                                paymentMethod: value,
                                invoice: invoiceNumber,
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
                        for (let i = 0; i < products.products.length; i++) {
                            let data = {
                                product_id: products.products[i].productId,
                                productName: products.products[i].productName,
                                productPrice: products.products[i].productPrice,
                                productImage: products.products[i].productImage,
                                productDiscription:products.products[i].discription,
                                quantity: products.products[i].quantity,
                                status: status,
                            }
                            items.push(data)
                        }

                    } else {
                        console.log('products not found in database...')
                    }
                    const invoiceData = getSampleData(invoiceNumber, items, name, phone)
                    // const invoicePDF = await generateInvoicePDF(invoiceData);
                    const orderOk = await Order.insertMany({
                        userId: user,
                        orders: [{
                            paymentMethod: value,
                            invoice: invoiceNumber,
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
        const productsPerPage = 6;
        const user = req.session.currentUserId
        console.log(`user id is ${user}`)
        const userId = new ObjectId(user)
        const data = await Order.findOne({ userId: user }).sort({ 'orders.date': -1 })
        data.orders.sort((a, b) => b.date - a.date);
        //pagination
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = data.orders.slice(start, end)
        if (data && data !== null && data !== undefined) {
            console.log(data)
            return res.render('user/orderlist.ejs', {
                title: 'orderList',
                data: paginatedProducts,
                currenPage: page,
                totaPages: Math.ceil(data.orders.length / productsPerPage)
            });
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
        const orderId = req.params.id
        const totalAmount=req.params.Tamount
        const paymentMethod=req.params.Pmethod
        const name=req.params.aName
        const phone=req.params.aPhone
        const date=req.params.date
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
            console.log(products);
            return res.render('user/viewOrderedProducts.ejs', { products:paginatedProducts,
                currenPage: page,
                id:orderId,
                totaPages: Math.ceil(products.length / productsPerPage),totalAmount,paymentMethod,name,phone,date})
        }
    } catch (error) {
        console.log(error)
    }
}

async function cancelOrder(req, res) {
    try {
        const orderId = req.params.id
        await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.isCancelled': true } })
        const cancel = await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.products.$[].status': 'CANCELLED' } })
        if (cancel) {
            console.log(cancel)
            // await Order.findOneAndUpdate({'orders._id':orderId},{$set:{'orders.$.products.$.status':'Cancelled'}})
            console.log('Order cancelled');
            res.redirect('/carts/orders/')
        }
    } catch (error) {
        console.log(error)
    }
}

async function changeStatus(req, res) {
    try {
        const orderId = req.params.id
        const status = req.params.status
        console.log(`order id is ${orderId} and Status is ${status}`)
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

module.exports = {
    paymentOptionPage,
    orderPost,
    orderHomePage,
    viewOrder,
    cancelOrder,
    changeStatus
}


// additional functons

async function generateInvoicePDF(invoiceData) {
    const result = await easyinvoice.createInvoice(invoiceData)
    return result.pdf
}

function getSampleData(invoiceNumber, items, name, phone) {
    return {
        images: {
            logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
            background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg'
        },
        sender: {
            company: 'SpareKit',
            address: 'sparekit, malappuram',
            zip: '1234 AB',
            city: 'Malappuram',
            country: 'India'
        },
        client: {
            name: name,
            phone: phone,
            address: '4567 CD',
            city: 'calicut',
            country: 'India'
        },
        information: {
            number: invoiceNumber, // Add the invoice number here
            date: '12-12-2021',
            'due-date': '31-12-2021'
        },
        products: items,
        'bottom-notice': 'Kindly pay your invoice within 30 days.',
        settings: {
            currency: 'INR'
        }
    };
}


function generateInvoiceNumber() {
    const prefix = "SPK"; // Your desired prefix
    const year = new Date().getFullYear(); // Get the current year
    const uniqueIdentifier = generateUniqueIdentifier(); // You need to implement this function
    const suffix = ""; // Optional: You can add a suffix if needed

    const invoiceNumber = `${prefix}-${year}-${uniqueIdentifier}${suffix}`;
    return invoiceNumber;
}

function generateUniqueIdentifier() {
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return randomNumber;
}

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