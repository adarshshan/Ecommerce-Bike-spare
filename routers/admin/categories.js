const express=require('express')
const router=express.Router()
const Categorie=require('../../models/categorie')
const categoryController=require('../../controller/categoryController')

router.get('/',categoryController.categoryHome)

router.post('/',categoryController.addCategories)

router.get('/add',(req,res)=>{
    res.render('admin/add_categories')
})
router.get('/delete/:id',categoryController.deleteCategory)

router.get('/edit/:id',categoryController.editCategory)

router.post('/update/:id',categoryController.updateCategory)

module.exports=router