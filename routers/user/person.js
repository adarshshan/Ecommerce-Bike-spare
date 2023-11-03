const express = require('express')
const router = express.Router()
const controller=require('../../controller/personController')

router.get('/',controller.personHome)
router.get('/productDetails/:id',controller.userDetailHome)


//--------Profile-----//
router.get('/profile',controller.profilePage)
router.get('/changeName/:name',controller.changeName)
router.get('/changePhone/:phone',controller.changePhone)
router.get('/changeEmail/:email',controller.changeEmail)
router.get('/verifyOtp',controller.otpPage)
router.post('/verifyOtp',controller.verifyOtpPost)
router.get('/changePassword/:old/:new',controller.changePassword)


//-----forgot password------//
router.get('/forgotPassword',controller.forgotPasswordPage)
router.get('/forgotPassword/:email',controller.forgotPasswordOtpSent)
router.get('/verifyForgot',controller.forgotOtpPage)
router.post('/verifyForgot',controller.verifyForgotPost)
router.get('/newpassword/:password/:cpassword',controller.newPasswordUpdate)


module.exports = router