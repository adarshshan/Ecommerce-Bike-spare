const express = require('express')
const router = express.Router()
const Coupon = require('../../models/coupon')
const controller=require('../../controller/couponController')


router.get('/',controller.couponHome);

router.post('/', controller.addCoupon);
router.get('/edit-coupon/:id/:amount/:date/:maxusage', controller.editCoupon);
router.get('/delete-coupon/:couponId', controller.deleteCoupon);
router.get('/coupon-deactivate/:couponId', controller.deactivateCoupon);
router.get('/coupon-activate/:id', controller.activateCoupon);

//userSide coupon usage

router.get('/verify-coupon/:total/:code', controller.verifyCoupon)

module.exports = router;

