const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const User = require('../../models/user')
const nodemailer = require('nodemailer')
const Brand = require('../../models/brand')
const Order = require('../../models/order');
const Category = require('../../models/categorie');
const Products = require('../../models/product')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const helpers = require('../../utils/helpers')
const localStorage = require('localStorage')


router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.productDetailHome)
router.get('/view-categorie-products/:categoryname', controller.categoryFilter)
router.get('/share-link/:email', controller.shareLink)
router.get('/error-page', controller.ErrorPage)
router.get('/err-internal',(req,res)=>{
    res.render('errorpage/500');
})
router.post('/search-product', async (req, res) => {
    try {
        const value = req.body.value;
        let searchNoSpecialChar = value.replace(/[^a-zA-Z0-9]/g, "");
        const results = await Products.find({ $and: [{ isDeleted: false }, { name: { $regex: new RegExp(searchNoSpecialChar, "i") } }] })
        console.log(`results are `)
        console.log(results)
        var categoryNames = await helpers.categoryName();
        const brands = await Brand.find({ isDeleted: false });
        res.render('user/categorieproduct.ejs', {
            title: 'view-categoryProducts.',
            filterResult: results,
            categoryNames,
            categorie: '',
            brands
        })
    } catch (error) {
        console.log(error)
    }
})
router.get('/category-details/:name', async (req, res) => {
    try {
        const categoryName = req.params.name;
        req.session.categoryName = categoryName;
        console.log('your category name is ', categoryName);
        const products = await Products.find({ isDeleted: false }).populate('categorieId', { _id: 0, name: 1 })
        let filterResult = [];
        console.log('the length is ', products.length)
        for (let i = 0; i < products.length; i++) {
            if (products[i].categorieId && products[i].categorieId.name === categoryName) {
                filterResult.push(products[i]);
            }
        }
        console.log(`the filtered result are `);
        console.log(filterResult);
        res.json({ success: true, filterResult, categoryName });
    } catch (error) {
        console.log(error);
    }
})
router.post('/filter-products', async (req, res) => {
    try {
        const { min, max, brands } = req.body;
        const category = req.session.categoryName;
        const categoryId = await Category.findOne({ $and: [{ isDeleted: false }, { name: category }] })
        if (min == 0 && max == 0 || !min && !max) {
            const filteredProducts = await Products.find({ $and: [{ isDeleted: false }, { categorieId: categoryId._id }, { brandId: { $in: brands } }] });
            if (!filteredProducts.length) return res.json({ success: false, category })
            return res.json({ success: true, filteredProducts, category })
        }
        const filteredProducts = await Products.find({ $and: [{ price: { $gt: min } }, { price: { $lt: max } }, { isDeleted: false }, { categorieId: categoryId._id }, { brandId: { $in: brands } }] });
        if (!filteredProducts.length) return res.json({ success: false, category })
        return res.json({ success: true, filteredProducts, category })
        
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
router.get('/forgotPassword', controller.forgotpageResponse)
router.get('/forgotPassword-page', controller.forgotPasswordPage)
router.get('/forgotPassword/:email', controller.forgotPasswordOtpSent)
router.get('/verifyForgot', controller.forgotOtpPage)
router.post('/verifyForgot', controller.verifyForgotPost)
router.get('/newpassword-page', controller.newpasswordPage);
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', userAuth, controller.wishlistHome)
router.get('/add-wishlist/:id', userAuth, controller.addToWishlist);
router.delete('/remove-wishlist/:id/:productId', userAuth, controller.removeWishlist)


//wallet
router.get('/wallet', userAuth, controller.walletHome)
router.get('/add-walletfund/:amount', userAuth, controller.addWalletFund)
router.get('/wallet-refund/:orderId', controller.refundWallet);
router.post('/veryfy-payment', controller.veryfyPay)
router.get('/pagination', userAuth, controller.walletHistoryPagination)



module.exports = router








