const Brand=require('../models/brand')

async function brandHome(req,res){
    const brandList = await Brand.find({isDeleted:false})
    res.render('admin/brands',{
        title:'Brands',
        data:brandList
    })
}

function addBrand(req,res){
    const brands = new Brand({
        name: req.body.name
    })
    brands.save()
        .then((brandCreated) => {
            // res.status(201).json(brandCreated)
            res.redirect('/brands')
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })  
        })
}

async function deleteBrand(req,res){
    let id=req.params.id
    const brand=await Brand.findById(id)
    brand.isDeleted=true
    brand.deleted_at=Date.now()
    await brand.save().then((s)=>{
        res.redirect('/brands')
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })
}

function editBrand(req,res){
    let id=req.params.id;
    Brand.findById(id).then((user)=>{
        res.render('admin/edit_brand',{
            title:"Edit brand",
            data:user
        })
    })
    .catch((err)=>{
        res.send(err);
    })
}

function updateBrand(req,res){
    let id =req.params.id
    Brand.findByIdAndUpdate(id,{
        name:req.body.name
    }).then((user)=>{
        res.redirect('/brands')
    })
    .catch((err)=>{
        res.send(err)
    })
}

module.exports={
    brandHome,
    addBrand,
    deleteBrand,
    editBrand,
    updateBrand
}