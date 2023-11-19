const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const User = require('../../models/user')
const Order = require('../../models/order');
const Products = require('../../models/product')


router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.userDetailHome)
router.get('/view-categorie-products/:categoryname', async (req, res) => {
    try {
        const categorie = req.params.categoryname;
        var categoryNames=await categoryName();
        const products = await Products.find({ isDeleted: false }).populate('categorieId', { _id: 0, name: 1 })
        console.log(`products is ${products[2].categorieId.name}`);
        let filterResult = [];
        console.log('the length is ', products.length)
        for (let i = 0; i < products.length; i++) {
            if (products[i].categorieId && products[i].categorieId.name === categorie) {
                filterResult.push(products[i]);
            }
        }
        console.log('result is herre boss')
        console.log(filterResult);
        res.render('user/categorieproduct.ejs', { title: 'view-categoryProducts.', filterResult,categoryNames,categorie})
    } catch (error) {
        console.log(error)
    }
})


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
router.get('/forgotPassword', controller.forgotPasswordPage)
router.get('/forgotPassword/:email', controller.forgotPasswordOtpSent)
router.get('/verifyForgot', controller.forgotOtpPage)
router.post('/verifyForgot', controller.verifyForgotPost)
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', userAuth, controller.wishlistHome)
router.get('/add-wishlist/:id', userAuth, controller.addToWishlist);
router.get('/remove-wishlist/:id', userAuth, controller.removeWishlist)


//wallet
router.get('/wallet', userAuth, controller.walletHome)
router.get('/add-walletfund/:amount', userAuth, controller.addWalletFund)
router.get('/wallet-refund/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId
        console.log(`your order id is ${orderId}`);
        const data = await Order.findOne({ 'orders._id': orderId }, { orders: { $elemMatch: { _id: orderId } } })
        const order = await Order.findOne({ 'orders._id': orderId })
        const userId = order.userId;
        const walletfund = data.orders[0].walletAmount;
        const total = data.orders[0].totalAmount;
        const RefundableAmount = walletfund + total;
        const changed = await IncreaseWalletBalance(userId, RefundableAmount);
        if (!changed) return res.json({ success: false, message: 'failed add the cancellation amount.' });
        await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.refund': false } })
        return res.json({ success: true, message: 'Cancellation amount added to the wallet' })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error occured.!' })
    }
})

module.exports = router


//additional functions

async function categoryName() {
    try {
        let productList = await Products.find({ isDeleted: false }).sort({ crated_at: -1 }).populate("categorieId", { _id: 0, name: 1 })

        // console.log(productList)
        let categoryNames = [...new Set(
            productList
                .filter(product => product.categorieId && product.categorieId.name) // Filter out null or undefined categorieId
                .map(product => product.categorieId.name)
        )];
        return categoryNames;
    } catch (error) {
        console.log(error)
    }
}

async function IncreaseWalletBalance(userId, amount) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': amount },
                $push: {
                    'wallet.transactions': {
                        type: 'debited',
                        amount: amount,
                        description: 'Order Cancelled by You.',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        )
        if (updatedUser) {
            console.log('Cancellation amount added to the wallet');
            return true;
        } else {
            console.log('failed add the cancellation amount.');
            return false;
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}