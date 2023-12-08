const express = require('express')
const router = express.Router()
const controller = require('../../controller/productController')
const adminAuth = require('../../middlware/adminAuth')


// router.use(adminAuth)

router.get(`/`, controller.productHome)
router.post(`/`, controller.addProduct)
router.get('/add', controller.addProdutPage)
router.delete('/delete/:id', controller.deleteProduct)
router.get('/update/:id', controller.updateProductpage)
router.post('/update/:id', controller.updateProduct)
router.get('/deleteImages/:id/:image',controller.deleteImage)

module.exports = router;