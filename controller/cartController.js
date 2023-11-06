const Cart = require('../models/cart')
const product = require('../models/product')
const notifier = require('node-notifier');
const path = require('path')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

async function cartHome(req, res) {
    try {
        const userId = req.session.currentUserId
        const cartId = req.session.cartId
        const car = new ObjectId(cartId)
        const use = new ObjectId(userId)
        if (!userId && !cartId) return res.render('user/cart.ejs', { title: 'shopping Cart', cartList: '', totalAmount: 0, totalProducts: 0 })
        const cartList = await Cart.find({ userId: userId })
            .populate({
                path: 'products.productId',
                select: 'name price image description stock quantity'
            })
        const justCart = await Cart.find({ _id: cartId })
            .populate({
                path: 'products.productId',
                select: 'name price image description stock quantity'
            })
        if (cartList && cartList.length > 0 && cartList !== undefined) {
            let { totalAmount, totalProducts } = await calculateTotalAmount({ userId: use })
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList, totalAmount, totalProducts })

        } else if (justCart && justCart.length > 0) {
            let totalAmount = await calculateTotalAmount({ _id: car })
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList, totalAmount, totalProducts })
        } else {
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList: '', totalAmount: 0, totalProducts: 0 })
        }

    } catch (error) {
        console.log(`An Error occured at ...${error}`)
    }

}

async function addCart(req, res) {
    try {
        const id = req.params.id
        const name=req.params.name
        const price=req.params.price
        const imageUri=req.params.image
        const userId = req.session.currentUserId
        if (!userId) {
            const cartId = req.session.cartId
            if (cartId && cartId !== null) {
                await Cart.findByIdAndUpdate(cartId, { $push: { products: { productId: id,productName:name,productPrice:price,productImage:imageUri } } })
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                console.log('products add to existing cart...')
                return res.redirect('/carts')
            } else {
                const resu = await Cart.insertMany({
                    products: [{ productId: id,productName:name,productPrice:price,productImage:imageUri }]
                })
                if (resu) {
                    req.session.cartId = resu[0]._id
                    await product.findByIdAndUpdate(id, { $set: { cart: true } })
                    return res.redirect('/carts')
                } else {
                    res.send('Somthing  trouble in inserting data')
                }
            }

        } else {
            const existCart = await Cart.findOne({ userId: userId })
            if (existCart) {
                let push = await Cart.findOneAndUpdate({ userId: userId }, { $push: { products: { productId: id,productName:name,productPrice:price,productImage:imageUri } } })
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
                    products: [{ productId: id,productName:name,productPrice:price,productImage:imageUri }]
                })
                if (resu) {
                    await product.findByIdAndUpdate(id, { $set: { cart: true } })
                    console.log('New cart created with userId ..')
                    res.redirect('/carts')
                } else {
                    res.send('Somthing  trouble in inserting data')
                }
            }

        }

    } catch (error) {
        console.log(`Error is at adding to cart ${error}`)
    }


}

async function removeCart(req, res) {
    try {
        const id = req.params.id
        const userId = req.session.currentUserId;

        const cartdelete = await Cart.findOneAndUpdate({ userId: userId }, { $pull: { products: { productId: id } } })
        if (cartdelete && cartdelete !== null) {
            await product.findByIdAndUpdate(id, { $set: { cart: false } })
            notifier.notify({
                title: 'Notifications',
                message: 'The Cart Item removed ',
                icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                wait: true
            })
            res.redirect('/carts')
        } else {
            res.send('An Error')
        }
    } catch (error) {
        console.log('The Error is at Remove from cart.' + error)
    }
}

async function increaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const cartId = req.session.cartId
        const use = new ObjectId(userId)
        if (userId) {
            await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': 1 } })
            let { totalAmount, totalProducts } = await calculateTotalAmount({ userId: use })
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
            res.json({ success: true, productQuantity, totalAmount, totalProducts })

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
}

async function decreaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const use = new ObjectId(userId)
        const cartId = req.session.cartId
        if (userId) {
            await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': -1 } })
            let { totalAmount, totalProducts } = await calculateTotalAmount({ userId: use })
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
            res.json({ success: true, productQuantity, totalAmount, totalProducts })
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
    } catch (error) {
        console.log('An error occured while decreasing the quantity...' + error)
    }
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
        console.log(`totalProducts ${result[0].totalProducts}`)
        let totalAmount = result[0].totalAmount
        let totalProducts = result[0].totalProducts
        return { totalAmount, totalProducts };
    } else {
        console.log('No results found.');
        return 0; // Return 0 if no results
    }
};




module.exports = {
    cartHome,
    addCart,
    removeCart,
    decreaseCount,
    increaseCount
}