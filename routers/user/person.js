const express = require('express')
const router = express.Router()
const Products = require('../../models/product')
const User = require('../../models/user')
const Brand = require('../../models/brand')
const bcrypt = require('bcrypt')
const categorie = require('../../models/categorie')

router.get('/', async (req, res) => {
    if(req.session.uesrid){
        delete req.session.uesrid
    }
    let productList = await Products.find({ isDeleted: false })
    if (!productList) {
        res.status(500).json({ success: false })
    } else {
        res.render('user/home_page', { title: 'home_page', products: productList })
    }

})






router.get('/productDetails/:id', async (req, res) => {
    let id = req.params.id;
    imgUri = process.env.IMG_URI
    const bid = await Products.findById({ _id: id }, { _id: 0, brandId: 1 })
    const cid = await Products.findById({ _id: id }, { _id: 0, categorieId: 1 })

    const bname = await Brand.find({ _id: bid.brandId }, { _id: 0, name: 1 });
    const cname = await categorie.find({ _id: cid.categorieId }, { _id: 0, name: 1 });

    const brandName = bname[0].name
    const categoryName = cname[0].name
    Products.findById({ _id: id }).then((products) => {
        // b=products.brandId;

        res.render('user/product_details', { title: 'Details', products, imgUri, brandName, categoryName })
    }).catch((err) => {
        res.redirect('/persons')
        console.log(err)
        console.log('Error is at get productDetails')
    })
    // let productList=await Products.findOne({_id:id})
    // if(!productList){
    //     res.status(500).json({success:false})
    //     }else{
    //         res.render('user/product_details',{title:'Details',products:productList})
    //     }

})

module.exports = router