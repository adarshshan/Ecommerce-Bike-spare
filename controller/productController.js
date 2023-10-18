const Product=require('../models/product')
const Brand=require('../models/brand')
const Category=require('../models/categorie')




async function productHome(req,res){
    const productList= await Product.find({isDeleted:false}).populate({
        path:'categorieId',
        select:'name'
    })
    .populate({
            path:'brandId',
            select:'name'
    })

    if(!productList){
    res.status(500).json({success:false})
    }else
    
    // res.send(productList)
    res.render('admin/products.ejs',{
        title:'Produts',
        data:productList
    })
}

function addProduct(req,res){
    let data=req.body
    // await Product.insertOne([product])
    if(data){
        let arrayimage = []
        for (let i = 0; i < req.files.length; i++) {
            arrayimage[i] = req.files[i].filename
        }
            
        const product= new Product({
            name:req.body.name,
            brandId:req.body.brandId,
            categorieId:req.body.categorieId,
            price:req.body.price,
            stock:req.body.stock,
            description:req.body.description,
            image:arrayimage
        })
        product.save().then((createdProduct =>{
            // res.status(201).json(createdProduct)
            
            req.session.message={
                type:'success',
                message:'Product Add successfully.'
            }
            res.redirect('/products')
        }))
        .catch((err)=>{
            console.log('the problem is here')
            res.status(500).json(console.log(err))
        })
    }else{
        res.redirect('/products/add')
    }
}

async function addProdutPage(req,res){
    let categorieList=await Category.find({isDeleted:false});
    const viewData={
        edit:false,
        categorieList
        
    }
    let brandList=await Brand.find({isDeleted:false})
    const showData={
        edit:false,
        brandList
    }
    res.render('admin/add_products',{viewData,showData,title:"add product"})
}

async function deleteProduct(req,res){
    let id=req.params.id
    let product = await Product.findById(id)
    product.isDeleted=true;
    product.deleted_at=Date.now()
    await product.save().then((result)=>{
        res.redirect('/products')
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })
}

async function updateProductpage(req,res){
    let id=req.params.id
    let categorieList=await Category.find();
    const viewData={
        edit:false,
        categorieList
        
    }
    let brandList=await Brand.find()
    const showData={
        edit:false,
        brandList
    }
    // Product.findById(id).then((product)=>{ console.log(product)
    //     res.render('admin/edit_product',{product,viewData,showData,title:'edit_product'})
    // })
    // .catch((err)=>{
    //     console.log('Problem is ata update get request.')
    //     console.log(err)
    //     res.redirect('/products/uptate/:id')
    // })
    const product=await Product.findById(id).populate({
        path:'categorieId',
        select:'name',
        select:'_id'
    }).populate({
        path:'brandId',
        select:'name',
        select:'_id'
    })
    const bid = await Product.findById({ _id: id }, { _id: 0, brandId: 1 })
    const cid = await Product.findById({ _id: id }, { _id: 0, categorieId: 1 })

    const bname = await Brand.find({ _id: bid.brandId }, { _id: 0, name: 1 });
    const cname = await Category.find({ _id: cid.categorieId }, { _id: 0, name: 1 });

    const brandid = bname[0]._id
    const categoryid = cname[0]._id
    res.render('admin/edit_product',{product,viewData,showData,title:'edit_product',brandid:brandid,categoryid:categoryid})

}

async function updateProduct(req,res){
    if(req.body){
        let arrayimage = []
        for (let i = 0; i < req.files.length; i++) {
            arrayimage[i] = req.files[i].filename
        }
    let id=req.params.id;
    await Product.findByIdAndUpdate(id,{
        name:req.body.name,
        brandId:req.body.brandId,
        categorieId:req.body.categorieId,
        price:req.body.price,
        stock:req.body.stock,
        description:req.body.description,
        image:arrayimage
    })
        res.redirect('/products')
    }else{
        return res.redirect(`/products/update/${id}`)
    }
    
}

module.exports={
    productHome,
    addProduct,
    addProdutPage,
    deleteProduct,
    updateProductpage,
    updateProduct
}