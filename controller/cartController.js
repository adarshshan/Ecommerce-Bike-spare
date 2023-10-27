const Cart = require('../models/cart')
const product = require('../models/product')
const notifier = require('node-notifier');
const path = require('path')
const { ObjectId } = require('mongoose').Types;


async function cartHome(req, res) {
    try {
        const userId = req.session.currentUserId
        const cartId = req.session.cartId
        const cartList = await Cart.find({ userId: userId })
            .populate({
                path: 'products.productId',
                select: 'name price image description stock quantity',
                // model: 'product'
            })
        let totalAmount = 0;
        let totalquantity = 0;
        if (cartList) {
            const result = await Cart.aggregate([
                {
                    $match: {userId:userId }
                },
                {
                    $unwind: "$products" // Assuming "items" is the array containing products in the cart
                },
                {
                    $lookup: {
                        from: "products", // The name of the product collection
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
                        totalAmount: { $sum: { $multiply: ["$product.price", "$product.quantity"] } }
                    }
                }
            ]);
            console.log(`result is ${result}`)
            if (result.length > 0) {
                totalAmount = result[0].totalAmount;
            }
            console.log(`totalAmount is ${totalAmount}`)
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList})

        } else {
            const cartList = await Cart.findOne({ _id: cartId }).populate({
                path: 'products.productId',
                select: 'name price image description stock'
            }).sort({ created_at: -1 })
            if (cartList) {
                cartList.products.forEach(product => {
                    product.totalPrice = product.productId.price * product.quantity;
                });
                return res.render('user/cart.ejs', { title: 'shopping Cart', cartList })
            } else {
                console.log('An error occured while rendering the cartlist...')
            }
        }
    } catch (error) {
        console.log(`An Error occured at ...${error}`)
    }

}



async function addCart(req, res) {
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

        } else {
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
                from: "product",
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
                totalAmount: { $sum: { $multiply: ["$product.price", "$products.quantity"] } }
            }
        }
    ]);

    console.log('Aggregation result:', result);

    if (result.length > 0) {
        console.log('Total Amount:', result[0].totalAmount);
        return result[0].totalAmount;
    } else {
        console.log('No results found.');
        return 0; // Return 0 if no results
    }
};


module.exports = {
    cartHome,
    addCart,
    removeCart
}