const User = require('../../models/user');
const express = require('express')
const router = express.Router()

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


router.get('/block/:id', async (req, res) => {
    let id = req.params.id
    let user = await User.findOne({ _id: id })
    user.isDeleted = true;
    user.blocked_at = Date.now()
    await user.save().then((rsult) => {
        res.redirect('/users')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})
router.get('/unblock/:id', async (req, res) => {
    let id = req.params.id
    let user = await User.findOne({ _id: id })
    user.isDeleted = false;
    user.unBlocked_at = Date.now()
    await user.save().then((result) => {
        res.redirect('/users')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })


})
//to verify the otp
router.post('/verifyOtp',controller.verifyOtp)

//resend verification
router.post('/resendtpVerficationCode',controller.resendOtp)


module.exports = router;