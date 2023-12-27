const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')


router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.productDetailHome)
router.get('/view-categorie-products/:categoryname', controller.categoryFilter)
router.get('/share-link/:email',userAuth, controller.shareLink)
router.get('/error-page', controller.ErrorPage)
router.get('/err-internal', controller.internalErrorPage)
router.post('/search-product', controller.searchProducts);
router.get('/category-details/:name', controller.categorywiseProducts)
router.post('/filter-products', controller.filteredProducts)


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
router.get('/newpassword-page', controller.newpasswordPage);
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', userAuth, controller.wishlistHome)
router.get('/add-wishlist/:id', controller.addToWishlist);
router.delete('/remove-wishlist/:id/:productId', userAuth, controller.removeWishlist)


//wallet
router.get('/wallet', userAuth, controller.walletHome)
router.get('/add-walletfund/:amount', userAuth, controller.addWalletFund)
router.get('/wallet-refund/:orderId', controller.refundWallet);
router.post('/veryfy-payment', controller.veryfyPay)
router.get('/pagination', userAuth, controller.walletHistoryPagination)



module.exports = router








