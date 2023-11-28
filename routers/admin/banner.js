const express = require('express')
const router = express.Router()
const Banner = require('../../models/banner')
const Product = require('../../models/product')


router.get('/', async (req, res) => {
    try {
        const bannerList = await Banner.find({ isDeleted: false }).populate('product')

        res.render('admin/banner.ejs', { title: 'banner Management', bannerList });
    } catch (error) {
        console.log(error)
    }
})
router.get('/add-banner', async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false });
        return res.render('admin/addBanner.ejs', { title: 'add-banner', products });
    } catch (error) {
        console.log(error)
    }
})
router.post('/', async (req, res) => {
    try {
        const title = req.body.title;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const description = req.body.description;
        const product = req.body.product;

        const uploadedImage = req.files[0].filename;
        console.log(title, startDate, endDate, description, product)
        console.log(uploadedImage)
        if (!uploadedImage) {
            return res.json({success:false,message:'Please upload an image'})
        }
        const newbanner = new Banner({
            title: title,
            product: product,
            description: description,
            image_url: uploadedImage,
            startDate: startDate,
            endDate: endDate
        })
        const saved = await newbanner.save()
        if (saved) {
            console.log(`Banner add successfully`)
            return res.json({ success:true,message: 'Banner added successfully' });
        } else {
            console.log('Failed to add the banner...');
            return res.json({success:false,message:'Failed to add the banner...'})
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/delete-banner/:id', async (req, res) => {
    try {
        const bannerId = req.params.id
        console.log(`banner id is ${bannerId}`);
        const deleted = await Banner.findByIdAndUpdate(bannerId, { $set: { isDeleted: true } })
        if (deleted) {
            console.log(`banner is deleted`);
            return res.json({ success: true, message: 'banner is deleted' })
        } else {
            console.log('banner Failed to delete.')
            return res.json({ success: false, message: 'banner is failed to delete' })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/deactivate-banner/:id', async (req, res) => {
    try {
        const bannerId = req.params.id
        const deactivated = await Banner.findByIdAndUpdate(bannerId, { $set: { isActive: false } });
        if (deactivated) {
            console.log('Banner Deactivated')
            res.json({ success: true, message: 'Banner Deactivated' })
        } else {
            console.log('Failed to deactivate')
            res.json({ success: false, message: 'Failed to deactivate' })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/activate-banner/:id', async (req, res) => {
    try {
        const bannerId = req.params.id
        const activate = await Banner.findByIdAndUpdate(bannerId, { $set: { isActive: true } })
        if (activate) {
            console.log('banner activated')
            res.json({ success: true, message: 'Banner Activated' });
        } else {
            console.log('banner failed to activate')
            res.json({ success: false, message: 'banner failed to activate' })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/edit-banner-form/:id/:title/:productName/:productId/:disc/:image/:start/:end', async (req, res) => {
    try {
        const bannerId = req.params.id
        const title = req.params.title
        const productName = req.params.productName
        const productId = req.params.productId
        const description = req.params.disc
        const img = req.params.image
        const Sdate = req.params.start
        const Edate = req.params.end
        const products = await Product.find({ isDeleted: false })
        const data = {
            id: bannerId,
            title: title,
            productName: productName,
            productId: productId,
            description: description,
            image: img,
            startDate: Sdate,
            endDate: Edate
        }
        console.log(`data is ${data}`);
        console.log(data);
        return res.render('admin/editBanner.ejs', { title: 'edit-banner', data, products })
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;