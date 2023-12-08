const express = require('express')
const router = express.Router()
const categoryController = require('../../controller/categoryController')
const adminAuth = require('../../middlware/adminAuth')

router.use(adminAuth)

router.get('/', categoryController.categoryHome)
router.post('/', categoryController.addCategories)
router.get('/add', categoryController.addCategoryPage)
router.delete('/delete/:id', categoryController.deleteCategory)
router.get('/edit/:id', categoryController.editCategory)
router.post('/update/:id', categoryController.updateCategory)

module.exports = router