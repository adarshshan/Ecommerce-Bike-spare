const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const Address = require('../../models/userDetail')
const User = require('../../models/user')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.userDetailHome)


//--------Profile-----//
router.get('/profile', userAuth, controller.profilePage)
router.get('/changeName/:name', userAuth, controller.changeName)
router.get('/changePhone/:phone', userAuth, controller.changePhone)
router.get('/changeEmail/:email', userAuth, controller.changeEmail)
router.get('/verifyOtp', userAuth, controller.otpPage)
router.post('/verifyOtp', userAuth, controller.verifyOtpPost)
router.get('/changePassword/:old/:new', userAuth, controller.changePassword)
router.get('/address', async (req, res) => {
    try {
        const addressBook = await Address.find({ userId: req.session.currentUserId })
        if (addressBook && addressBook !== null && addressBook !== undefined) {
            console.log(`data is here`);
            return res.json({ success: true, message: 'success part', addressBook });
        } else {
            console.log('failed to find data...')
            return res.json({ success: false, message: 'Data not found', addressBook: '' });
        }
    } catch (error) {
        console.log('Error occured at catch block...')
        console.log(error)
    }
})


//-----forgot password------//
router.get('/forgotPassword', controller.forgotPasswordPage)
router.get('/forgotPassword/:email', controller.forgotPasswordOtpSent)
router.get('/verifyForgot', controller.forgotOtpPage)
router.post('/verifyForgot', controller.verifyForgotPost)
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', async (req, res) => {
    try {
        const userId = req.session.currentUserId
        const users = await User.findById(userId).populate('wishlist.productId')
        console.log('users')
        const wishlist = users.wishlist.sort((a, b) => b.date - a.date)
        console.log(wishlist)
        return res.render('user/wishlist.ejs', { title: 'wishlist', wishlist })
    } catch (error) {
        console.log(error)
    }
})
router.get('/add-wishlist/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.currentUserId;
        if (!userId) return res.json({ success: false, message: 'user not logined...' });
        // Check if the product already exists in the user's wishlist
        const user = await User.findOneAndUpdate(
            { _id: userId, 'wishlist.productId': { $ne: productId } },
            { $push: { wishlist: { productId: productId } } },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: 'The product is already in the wishlist.' });
        }

        console.log('Product added to wishlist');
        return res.json({ success: true, message: 'Product added to wishlist.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'An error occurred while adding the product to wishlist.' });
    }
});
router.get('/remove-wishlist/:id', async (req, res) => {
    try {
        const Id = req.params.id
        const userId = req.session.currentUserId;
        const removed = await User.findByIdAndUpdate(userId, { $pull: { wishlist: { _id: Id } } })
        if (removed && removed !== null && removed !== undefined) {
            console.log('product removed from the wishlist.')
            return res.json({ success: true, message: 'product removed from the wishlist.' });
        } else {
            console.log('Somthing went wrong...');
            return res.json({ success: false, message: 'Failed to remove the product from the wishlist.' });
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' });
    }
})


//wallet

router.get('/wallet', async (req, res) => {
    try {
        const userId = req.session.currentUserId
        const id = new ObjectId(userId)
        const userwallet=await User.findById(userId,{_id:0,wallet:1})
        const balance=userwallet.wallet.balance
        const wallet=await User.aggregate([
            { $match: { _id: id } },
            { $unwind: "$wallet.transactions" },
            { $sort: { "wallet.transactions.time": -1 } },
            { 
              $group: {
                _id: "$_id",
                wallet: { $push: "$wallet.transactions" }
              }
            },
            { $project: { _id: 0, wallet: 1 } }
          ])
        // console.log(wallet[0].wallet);
        // console.log(wallet[0]);
        res.render('user/wallet.ejs', { title: 'wallet',wallet,balance});
    } catch (error) {
        console.log(error)
    }
})
router.get('/add-walletfund/:amount', async (req, res) => {
    try {
        const amount = req.params.amount
        const userId = req.session.currentUserId
        console.log(`amount is ${amount}`);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': amount },
                $push: {
                    'wallet.transactions': {
                        type: 'debited',
                        amount: amount,
                        description: 'fund add by the user',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        )
        if (updatedUser) {
            // console.log(updatedUser.wallet.transactions)
            console.log(`updateddddd...`)
            console.log(updatedUser.wallet)
            let walletDetails=updatedUser.wallet;
            return res.json({success:true,message:'Amouont added successfully.',walletDetails});
        } else {
            console.log('Amount Failed to add to the wallet...')
            return res.json({success:false,message:'Amount Failed to add to the wallet...'});
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router