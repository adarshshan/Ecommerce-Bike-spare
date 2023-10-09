const express=require('express')
const router=express.Router()
const Categorie=require('../../models/categorie')

router.get('/',async (req,res)=>{
    const categorieList=await Categorie.find()
    res.render('admin/categories',{
        title:'Categories',
        data:categorieList
    })
    // res.send(categorieList)
})

router.post('/',(req,res)=>{
    const categorie=new Categorie({
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

})
router.get('/add',(req,res)=>{
    res.render('admin/add_categories')
})
router.get('/delete/:id',(req,res)=>{
    let id=req.params.id;
    Categorie.findByIdAndRemove(id).then((result)=>{
        res.redirect('/categories')
    })
    .catch((err)=>{
        res.send(err)
    })
})
router.get('/edit/:id',(req,res)=>{
    let id =req.params.id;
    Categorie.findById(id).then((coll)=>{
        res.render('admin/edit_categorie',{
            title:'edit_categories',
            data:coll
        })
    })
})
router.post('/update/:id',(req,res)=>{
    let id=req.params.id
    Categorie.findByIdAndUpdate(id,{
        name:req.body.name
    }).then((result)=>{
        res.redirect('/categories')
    }).catch((err)=>{
        res.send(err)
    })
})
module.exports=router