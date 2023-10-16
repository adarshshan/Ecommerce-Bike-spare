const Category=require('../models/categorie')
const Product=require('../models/product')

async function categoryHome (req,res){
    const categorieList=await Category.find({isDeleted:false})
    res.render('admin/categories',{
        title:'Categories',
        data:categorieList
    })
}

function addCategories(req,res){
    console.log('im here')
    const categorie=new Category({
        name:req.body.name
    })
    categorie.save()
    .then((categorieCreated)=>{
        // res.status(201).json(categorieCreated)
        res.redirect('/categories')
    })
    .catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
}

async function deleteCategory(req,res){
    let id=req.params.id;
    const category=await Category.findById(id)
    category.isDeleted=true
    category.deleted_at=Date.now();
    await category.save().then((result)=>{
        res.redirect('/categories')
    }).catch((err)=>{
        res.send(err)
        console.log(err)
    })
}

function editCategory(req,res){
    let id =req.params.id;
    Category.findById(id).then((coll)=>{
        res.render('admin/edit_categorie',{
            title:'edit_categories',
            data:coll
        })
    })
}

function updateCategory(req,res){
    let id=req.params.id
    Category.findByIdAndUpdate(id,{
        name:req.body.name
    }).then((result)=>{
        res.redirect('/categories')
    }).catch((err)=>{
        res.send(err)
    })
}
module.exports={
    categoryHome,
    addCategories,
    deleteCategory,
    editCategory,
    updateCategory
}