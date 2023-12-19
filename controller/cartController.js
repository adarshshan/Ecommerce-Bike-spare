const Cart = require('../models/cart')
const product = require('../models/product')
const notifier = require('node-notifier');
const localStorage = require("localStorage")
const path = require('path')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const helpers=require('../utils/helpers')

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
            let { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: use })
            return res.render('user/cart.ejs', { title: 'shopping_Cart', cartList, totalAmount, totalProducts, totalDiscount })

        } else {
            return res.render('user/cart.ejs', { title: 'shopping_Cart', cartList: '', totalAmount: 0, totalProducts: 0, totalDiscount: 0 })
        }

    } catch (error) {
        console.log(`An Error occured at ...${error}`)
        return res.redirect('/err-internal')
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
                return res.json({success:false,message:'Somthing trouble occuring while product add to cart.!'});
            }
        } else {
            const resu = await Cart.insertMany({
                userId: userId,
                products: [{ productId: id, productName: name, productPrice: price, productImage: imageUri, discription: discription }]
            })
            if (resu) {
                await product.findByIdAndUpdate(id, { $set: { cart: true } })
                console.log('New cart created with userId ..')
                return res.json({ success: true, message: 'New cart created with userId' })
            } else {
                return res.json({success:false,message:'Somthing trouble occuring while product add to cart.!'});
            }
        }

    } catch (error) {
        console.log(`Error is at adding to cart ${error}`)
        return res.json({success:false,err:true});
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
        return res.json({success:false,err:true});
    }
}

async function increaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const use = new ObjectId(userId)
        if (!userId) return res.json({ success: false, message: 'user not logined' });
        let productdetails = await product.findById(idd);
        console.log(`the product details are ${productdetails}`);
        const currQuantity = await Cart.findOne({ userId: userId, 'products.productId': id }, { _id: 0, 'products.quantity': 1 })
        if (currQuantity) {
            let currentQuantity = currQuantity.products[0].quantity
            if (currentQuantity === productdetails.stock || currentQuantity > productdetails.stock) return res.json({ success: false, message: 'Out of stock' });
        }
        await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': 1 } })
        let { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: use })
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
        // console.log(`Quantity: ${productQuantity}`);
        if (req.session.discount) delete req.session.discount;
        return res.json({ success: true, productQuantity, totalAmount, totalProducts, totalDiscount })


    } catch (error) {
        console.log(`An error occured while increasing the Quantity...${error}`)
        return res.json({ success: false, err:true })
    }
}

async function decreaseCount(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        const userId = req.session.currentUserId
        const use = new ObjectId(userId)
        if (!userId) return res.json({ success: false, message: 'user not logined!' });
        const currQuantity = await Cart.findOne({ userId: userId, 'products.productId': id }, { _id: 0, 'products.quantity': 1 })
        if (currQuantity) {
            let currentQuantity = currQuantity.products[0].quantity
            if (currentQuantity === 1) return res.json({ success: false, message: 'Quantity must be more than 1.' });
        }
        await Cart.updateOne({ userId: userId, 'products.productId': id }, { $inc: { 'products.$.quantity': -1 } })
        let { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: use })
        // console.log(`totalAmount ${totalAmount} totalProducts ${totalProducts} totalDiscount ${totalDiscount}`);
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
                    _id: 0, 
                    quantity: "$products.quantity"
                }
            }
        ])
        let productQuantity = q[0].quantity
        if (req.session.discount) delete req.session.discount;
        return res.json({ success: true, productQuantity, totalAmount, totalProducts, totalDiscount })

    } catch (error) {
        console.log('An error occured while decreasing the quantity...' + error)
        return res.json({ success: false, err:true })
    }
}



module.exports = {
    cartHome,
    addCart,
    removeCart,
    decreaseCount,
    increaseCount
}