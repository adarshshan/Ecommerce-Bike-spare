const User = require('../../models/user');
const express = require('express')
const router = express.Router()
const adminAuth = require('../../middlware/adminAuth')
const controller = require('../../controller/userController')
const addressModel = require('../../models/userDetail')
const Cart = require('../../models/cart')
require('dotenv/config')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;



router.get('/', adminAuth, controller.userHome)
//to render teh login page
router.get('/login', controller.loginPage)
//to render the signup page
router.get('/signup', (req, res) => {
    res.render('user/signup', { title: 'user signUp' })
})

router.post('/login', controller.userLogin)

router.post('/', controller.userSignup)

router.get('/validateEmail/:email', controller.validateEmail)

router.get('/logout', controller.userLogout)

router.get('/block/:id', controller.blockUser)

router.get('/unblock/:id', controller.unBlockUser)

router.post('/verifyOtp', controller.verifyOtp)

router.post('/resendtpVerficationCode', controller.resendOtp)

//------address------

router.get('/checkout', async (req, res) => {
    const userId = req.session.currentUserId
    const user = new ObjectId(userId)
    if (userId) {
        const address = await addressModel.findOne({ userId: userId })
        const cart = await Cart.findOne({ userId: userId })
        if (cart && cart !== null && cart !== undefined &&cart.products.length!==0) {
            
            const { totalAmount, totalProducts } = await calculateTotalAmount({ userId: user })
            var addressDetails
            if (address && address !== null) {
                addressDetails = address.address;
            } else {
                console.log('data not found')
            }
            res.render('user/checkout.ejs', { title: 'checkout', addressDetails, totalAmount, totalProducts })
        }else{
            console.log('Cart is empty')
            return res.redirect('/carts')
        }


    } else {
        console.log('not userid')
        return res.redirect('/users/login');
    }

})
router.post('/address', async (req, res) => {
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
    }
})

router.get('/address_get', async (req, res) => {
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
})

router.post('/updateAddress/:id', async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        console.log(data)
        console.log(`id is ${id}  and the data is ${data}`)
        // const update=await addressModel.findOneAndUpdate({'address._id':id},{$set:{address:[data]}})
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
        // const updated=await addressModel.findByIdAndUpdate(id,{$set:{address:[data]}})
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
})

router.get('/delete_address/:id', async (req, res) => {
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

})

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

module.exports = router;