const express = require('express')
const router = express.Router()
const controller=require('../../controller/brandController')
const adminAuth=require('../../middlware/adminAuth')

router.use(adminAuth)

router.get('/',controller.brandHome)

router.post('/',controller.addBrand)

router.get('/add',(req,res)=>{
    res.render('admin/add_brands',{title:'add-brand',msg:''})
})

router.get('/delete/:id',controller.deleteBrand)

router.get('/edit/:id',controller.editBrand)

router.post('/update/:id',controller.updateBrand)

module.exports = router