const Cart = require('../models/cart')
const addressModel = require('../models/userDetail')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const helpers = require('../utils/helpers')
const localStorage = require("localStorage")



async function checkoutPage(req, res) {
    try {
        const userId = req.session.currentUserId
        const user = new ObjectId(userId)
        if (userId) {
            const address = await addressModel.findOne({ userId: userId })
            const cart = await Cart.findOne({ userId: userId })
            var addressDetails
            if (address && address !== null) {
                addressDetails = address.address;
            } else {
                console.log('data not found')
            }
            if (localStorage.getItem("product")) {
                console.log('Buy Now')
                let product = JSON.parse(localStorage.getItem("product"));
                console.log(product)
                const totalDiscount = product.price * product.discount / 100;
                const totalAmount = product.price - totalDiscount;
                const totalProducts = 1;
                return res.render('user/checkout.ejs', { title: 'checkout', addressDetails, totalAmount, totalProducts, totalDiscount })
            }
            if (cart && cart !== null && cart !== undefined && cart.products.length !== 0) {

                const { totalAmount, totalProducts, totalDiscount } = await helpers.calculateTotalAmount({ userId: user })

                res.render('user/checkout.ejs', { title: 'checkout', addressDetails, totalAmount, totalProducts, totalDiscount })
            } else {
                console.log('Cart is empty')
                return res.redirect('/carts')
            }


        } else {
            console.log('User not logined')
            return res.redirect('/users/login');
        }
    } catch (error) {
        console.log(error)
        return res.redirect('/err-internal')
    }
}

async function addAddress(req, res) {
    try {
        const userId = req.session.currentUserId
        const data = req.body
        if (userId) {
            const exist = await addressModel.findOne({ userId: userId })
            if (exist && exist !== null) {
                await addressModel.findOneAndUpdate({ userId: userId }, { $push: { address: [data] } })
            } else {
                await addressModel.insertMany({
                    userId: userId,
                    address: [data]
                })
            }
            res.json({ message: 'address added successfully' })
        } else {
            console.log('UserId is not available...')
            return res.redirect('/users/login')
        }
    } catch (error) {
        console.log(`Error at post address${error}`)
        return res.redirect('/err-internal')
    }
}

async function addressGet(req, res) {
    try {
        const userId = req.session.currentUserId
        const addressList = await addressModel.findOne({ userId: userId })
        if (addressList && addressList !== null) {
            res.json({ addressList: addressList })
        } else {
            console.log("address with provided userId does not exist...")
        }
    } catch (error) {
        console.log(`Error at address get...${error}`)
    }
}

async function updateAddress(req, res) {
    try {
        const id = req.params.id
        const data = req.body
        console.log(data)
        console.log(`id is ${id}  and the data is ${data}`)
        const update = await addressModel.findOneAndUpdate({ 'address._id': id }, {
            $set: {
                'address.$.name': data.name,
                'address.$.phone': data.phone,
                'address.$.fullAddress': data.fullAddress,
                'address.$.pinCode': data.pinCode,
                'address.$.district': data.district,
                'address.$.landmark': data.landmark,
                'address.$.alternativePhone': data.alternativePhone,
            }
        })

        if (update) {
            console.log(`successfully updated...`);
            return res.json({ message: 'address successfully updated' })
        } else {
            console.log(`updation failed..`)
            return res.json({ message: 'address updation failed...' })
        }

    } catch (error) {
        console.log('Error while updating the address At /users/updateAddress')
    }
}

async function deleteAddress(req, res) {
    try {
        const idd = req.params.id
        const id = new ObjectId(idd)
        console.log('it is your address id ' + id)
        const userId = req.session.currentUserId
        const deleted = await addressModel.findOneAndUpdate({ userId: userId }, { $pull: { address: { _id: id } } })
        const addressList = await addressModel.findOne({ userId: userId })
        if (deleted) {
            console.log('Address removed...')
            res.json({ addressList: addressList })
        }
    } catch (error) {
        cosole.log(error)
    }
}

module.exports = {
    checkoutPage,
    addAddress,
    addressGet,
    updateAddress,
    deleteAddress
}
