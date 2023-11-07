const express = require('express')
const router = express.Router()
const controller=require('../../controller/personController')
const userAuth=require('../../middlware/userAuth')

router.get('/',controller.personHome)
router.get('/productDetails/:id',controller.userDetailHome)


//--------Profile-----//
router.get('/profile',userAuth,controller.profilePage)
router.get('/changeName/:name',userAuth,controller.changeName)
router.get('/changePhone/:phone',userAuth,controller.changePhone)
router.get('/changeEmail/:email',userAuth,controller.changeEmail)
router.get('/verifyOtp',userAuth,controller.otpPage)
router.post('/verifyOtp',userAuth,controller.verifyOtpPost)
router.get('/changePassword/:old/:new',userAuth,controller.changePassword)


//-----forgot password------//
router.get('/forgotPassword',controller.forgotPasswordPage)
router.get('/forgotPassword/:email',controller.forgotPasswordOtpSent)
router.get('/verifyForgot',controller.forgotOtpPage)
router.post('/verifyForgot',controller.verifyForgotPost)
router.get('/newpassword/:password/:cpassword',controller.newPasswordUpdate)


module.exports = router