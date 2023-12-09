const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const User = require('../../models/user')
const nodemailer = require('nodemailer')
const Order = require('../../models/order');
const Products = require('../../models/product')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const helpers = require('../../utils/helpers')
const localStorage = require('localStorage')


router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.userDetailHome)
router.get('/view-categorie-products/:categoryname', controller.categoryFilter)
router.get('/share-link/:email', controller.shareLink)
router.get('/error-page', controller.ErrorPage)

//--------Profile-----//
router.get('/profile', userAuth, controller.profilePage)
router.get('/changeName/:name', userAuth, controller.changeName)
router.get('/changePhone/:phone', userAuth, controller.changePhone)
router.get('/changeEmail/:email', userAuth, controller.changeEmail)
router.get('/verifyOtp', userAuth, controller.otpPage)
router.post('/verifyOtp', userAuth, controller.verifyOtpPost)
router.get('/changePassword/:old/:new', userAuth, controller.changePassword)
router.get('/address', userAuth, controller.addressBook)


//-----forgot password------//
router.get('/forgotPassword', controller.forgotpageResponse)
router.get('/forgotPassword-page', controller.forgotPasswordPage)
router.get('/forgotPassword/:email', controller.forgotPasswordOtpSent)
router.get('/verifyForgot', controller.forgotOtpPage)
router.post('/verifyForgot', controller.verifyForgotPost)
router.get('/newpassword-page',controller.newpasswordPage);
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', userAuth, controller.wishlistHome)
router.get('/add-wishlist/:id', userAuth, controller.addToWishlist);
router.delete('/remove-wishlist/:id', userAuth, controller.removeWishlist)


//wallet
router.get('/wallet', userAuth, controller.walletHome)
router.get('/add-walletfund/:amount', userAuth, controller.addWalletFund)
router.get('/wallet-refund/:orderId', controller.refundWallet);
router.post('/veryfy-payment', controller.veryfyPay)
router.get('/pagination', userAuth, controller.walletHistoryPagination)



module.exports = router








