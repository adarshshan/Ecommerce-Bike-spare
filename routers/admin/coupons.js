const express = require('express')
const router = express.Router()
const Coupon = require('../../models/coupon')
const controller = require('../../controller/couponController')
const adminAuth = require('../../middlware/adminAuth')
const userAuth = require('../../middlware/userAuth')

router.get('/', controller.couponHome);
router.post('/', controller.addCoupon);
router.get('/edit-coupon/:id/:minDiscount/:minPurchase/:maxDiscount/:maxPurchase/:date/:maxusage', adminAuth, controller.editCoupon);
router.delete('/delete-coupon/:couponId', adminAuth, controller.deleteCoupon);
router.get('/coupon-deactivate/:couponId', adminAuth, controller.deactivateCoupon);
router.get('/coupon-activate/:id', adminAuth, controller.activateCoupon);

//userSide coupon usage

router.get('/verify-coupon/:total/:code', userAuth, controller.verifyCoupon)
router.get('/cancelCoupon', userAuth, controller.cancelCoupon);

module.exports = router;

