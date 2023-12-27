const express = require('express')
const router = express.Router()
const controller=require('../../controller/bannerController')
const adminAuth=require('../../middlware/adminAuth')

router.use(adminAuth) 

router.get('/',controller.bannerHome );
router.get('/add-banner',controller.addBannerPage);
router.post('/', controller.addBannerPost);
router.delete('/delete-banner/:id', controller.deleteBanner);
router.get('/deactivate-banner/:id',controller.deactivateBanner );
router.get('/activate-banner/:id', controller.activateBanner);
router.get('/edit-banner-form/:id', controller.editBannerPage);
router.post('/update-banner', controller.editBannerPost);

module.exports = router;