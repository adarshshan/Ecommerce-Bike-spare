const Cart = require('../models/cart')
const product = require('../models/product')
const notifier = require('node-notifier');
const localStorage = require("localStorage")
const path = require('path')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

async function cartHome(req, res) {
    try {
        const userId = req.session.currentUserId
        const use = new ObjectId(userId)
        if (!userId) return res.render('user/cart.ejs', { title: 'shopping Cart', cartList: '', totalAmount: 0, totalProducts: 0, totalDiscount: 0 })
        const cartList = await Cart.find({ userId: userId })
            .populate({
                path: 'products.productId',
                select: 'name price image discount description stock quantity'
            })
        if (cartList && cartList.length > 0 && cartList !== undefined) {
            let { totalAmount, totalProducts, totalDiscount } = await calculateTotalAmount({ userId: use })
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList, totalAmount, totalProducts, totalDiscount })

        } else {
            return res.render('user/cart.ejs', { title: 'shopping Cart', cartList: '', totalAmount: 0, totalProducts: 0, totalDiscount: 0 })
        }

    } catch (error) {
        console.log(`An Error occured at ...${error}`)
        res.redirect('/error-page');
    }

}

async function addCart(req, res) {
    try {
        const id = req.params.id//product id
        const name = req.params.name
        const price = req.params.price
        const imageUri = req.params.image
        const discription = req.params.disc;
        const userId = req.session.currentUserId
        if (localStorage.getItem("product")) localStorage.removeItem('product');
        const exist = await Cart.findOne({ userId: userId, products: { $elemMatch: { productId: id } } });
        if (exist) return res.json({ success: false, message: 'Product is already in cartlist...' })
        if (!userId) return res.json({ success: false, message: 'User not logined!' })
        const existCart = await Cart.findOne({ userId: userId })
        if (existCart) {
            let push = await Cart.findOneAndUpdate({ userId: userId }, { $push: { products: { $each: [{ productId: id, productName: name, productPrice: price, productImage: imageUri, discription: discription }], $position: 0 } } })
            if (push) {
                if (req.session.discount) delete req.session.discount;
                notifier.notify({
                    title: 'Notifications',
                    message: 'Product successfully added to cart List.. ',
                    icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                    wait: true
                })
                // return res.redirect('/carts')
                return res.json({ success: true, message: 'Product successfully added to cart List' })
            } else {
                return res.send('Product is not going to the cart list')
            }
        } else {
            const resu = await Cart.insertMany({
                userId: userId,
                products: [{ productId: id, productName: name, productPrice: price, productImage: imageUri, discription: discription }]
            })
            if (resu) {
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                console.log('New cart created with userId ..')
                // res.redirect('/carts')
                return res.json({ success: true, message: 'New cart created with userId' })
            } else {
                res.send('Somthing  trouble in inserting data')
            }
        }

    } catch (error) {
        console.log(`Error is at adding to cart ${error}`)
        // return res.json({ success: false, message: 'Error is at adding to cart' })
        res.redirect('/error-page');
    }


}

async function removeCart(req, res) {
    try {
        const id = req.params.id
        const userId = req.session.currentUserId;

        const cartdelete = await Cart.findOneAndUpdate({ userId: userId }, { $pull: { products: { productId: id } } })
        if (cartdelete && cartdelete !== null) {
            await product.findByIdAndUpdate(id, { $set: { cart: false } })
            if (req.session.discount) delete req.session.discount;
            notifier.notify({
                title: 'Notifications',
                message: 'The Cart Item removed ',
                icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                wait: true
            })
            // res.redirect('/carts')
            return res.json({ success: true, message: 'Cart item removed.' })
        } else {
            // res.send('An Error')
            return res.json({ success: false, message: 'Cart item Failed to remove.' })
        }
    } catch (error) {
        console.log('The Error is at Remove from cart.' + error)
        res.redirect('/error-page');
    }
}

async function increaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const cartId = req.session.cartId
        const use = new ObjectId(userId)
        if (!userId) return res.json({ success: false });

        await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': 1 } })
        let { totalAmount, totalProducts, totalDiscount } = await calculateTotalAmount({ userId: use })
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
        if (req.session.discount) delete req.session.discount;
        res.json({ success: true, productQuantity, totalAmount, totalProducts, totalDiscount })


    } catch (error) {
        console.log(`An error occured while increasing the Quantity...${error}`)
        res.redirect('/error-page');
    }
}

async function decreaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const use = new ObjectId(userId)
        if (!userId) return res.json({ success: false });

        await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': -1 } })
        let { totalAmount, totalProducts, totalDiscount } = await calculateTotalAmount({ userId: use })
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
        if (req.session.discount) delete req.session.discount;
        return res.json({ success: true, productQuantity, totalAmount, totalProducts, totalDiscount })

    } catch (error) {
        console.log('An error occured while decreasing the quantity...' + error)
        // return res.json({ success: false })
        res.redirect('/error-page');
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
                totalAmount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    {
                                        $subtract: [
                                            "$product.price",
                                            { $multiply: ["$product.price", { $divide: ["$product.discount", 100] }] }
                                        ]
                                    },
                                    "$products.quantity"
                                ]
                            },
                            else: { $multiply: ["$product.price", "$products.quantity"] }
                        }
                    }
                },
                totalDiscount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    "$product.price",
                                    { $divide: ["$product.discount", 100] },
                                    "$products.quantity"
                                ]
                            },
                            else: 0
                        }
                    }
                },
                totalProducts: { $sum: 1 }
            }
        }
    ]);


    console.log('Aggregation result:', result);




    if (result.length > 0) {
        console.log('Total Amount:', result[0].totalAmount);
        console.log(`totalProducts ${result[0].totalProducts}`)
        console.log(`totalDiscount ${result[0].totalDiscount}`)
        let totalAmount = result[0].totalAmount
        let totalProducts = result[0].totalProducts
        let totalDiscount = result[0].totalDiscount
        return { totalAmount, totalProducts, totalDiscount };
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