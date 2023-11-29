const express = require('express')
const router = express.Router()
const Banner = require('../../models/banner')
const Product = require('../../models/product')
const controller=require('../../controller/bannerController')


router.get('/',controller.bannerHome );
router.get('/add-banner',controller.addBannerPage);
router.post('/', controller.addBannerPost);
router.get('/delete-banner/:id', controller.deleteBanner);
router.get('/deactivate-banner/:id',controller.deactivateBanner );
router.get('/activate-banner/:id', controller.activateBanner);
router.get('/edit-banner-form/:id', controller.editBannerPage);
router.post('/update-banner', controller.editBannerPost);

module.exports = router;