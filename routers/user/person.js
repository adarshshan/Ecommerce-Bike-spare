const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const Address = require('../../models/userDetail')
const User = require('../../models/user')

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
        const users = await User.findById(userId)
        console.log(`userDetails is ${users}`)
        const wishlist = users.wishlist
        console.log(`Wishlist is ${wishlist}`)
    } catch (error) {
        console.log(error)
    }
})
router.get('/add-wishlist/:id', async (req, res) => {
    try {
        const productId = req.params.id
        const userId = req.session.currentUserId
        const exist = await User.find({ _id: userId, 'wishlist.productId':productId });
        console.log(`exist is ${exist}`);
        if (exist && exist !== null && exist !== undefined) return res.json({ success: false, message: 'The product is already exist in wishlist...' });
        const inserted = await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: { productId: productId } } })
        if (!inserted) return res.json({ success: false, message: 'The product is already exist in wishlist or occured another error' });
        console.log('Product added to wishlist');
        return res.json({ success: true, message: 'Product added to wishlist.' });
    } catch (error) {
        console.log(error)
    }
})


module.exports = router