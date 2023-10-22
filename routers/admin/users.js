const User = require('../../models/user');
const express = require('express')
const router = express.Router()
const adminAuth=require('../../middlware/adminAuth')
const {body,validationResult}=require('express-validator')
const controller=require('../../controller/userController')
require('dotenv/config')


router.get('/',controller.userHome)
//to render teh login page
router.get('/login',controller.loginPage)
//to render the signup page
router.get('/signup', (req, res) => {
    res.render('user/signup', { title: 'user signUp' })
})

router.post('/login',controller.userLogin)

router.post('/',controller.userSignup)

router.get('/logout',controller.userLogout)


router.get('/block/:id',controller.blockUser)

router.get('/unblock/:id',controller.unBlockUser)

//to verify the otp
router.post('/verifyOtp',controller.verifyOtp)

//resend verification
router.post('/resendtpVerficationCode',controller.resendOtp)


module.exports = router;