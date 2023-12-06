
const express = require('express')
const router = express.Router()
const adminAuth = require('../../middlware/adminAuth')
const userAuth = require('../../middlware/userAuth')
const controller = require('../../controller/userController')
const checkoutController = require('../../controller/checkoutController')
const addressModel = require('../../models/userDetail')
const Cart = require('../../models/cart')
require('dotenv/config')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;



router.get('/', adminAuth, controller.userHome)
router.get('/login', controller.loginPage)
router.get('/signup', controller.userSignupPage)
router.post('/login', controller.userLogin)
router.post('/', controller.userSignup)
router.get('/validateEmail/:email', controller.validateEmail)
router.get('/logout', controller.userLogout)
router.get('/block/:id', adminAuth, controller.blockUser)
router.get('/unblock/:id', adminAuth, controller.unBlockUser)
router.post('/verifyOtp', controller.verifyOtp)
router.post('/resendtpVerficationCode', controller.resendOtp)

//------checkout--------address------

router.get('/checkout', userAuth, checkoutController.checkoutPage)
router.post('/address', userAuth, checkoutController.addAddress)
router.get('/address_get', userAuth, checkoutController.addressGet)
router.post('/updateAddress/:id', userAuth, checkoutController.updateAddress)
router.get('/delete_address/:id', userAuth, checkoutController.deleteAddress)

module.exports = router;