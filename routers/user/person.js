const express = require('express')
const router = express.Router()
const Products = require('../../models/product')
const User = require('../../models/user')
const bcrypt = require('bcrypt')

router.get('/', async (req, res) => {
    let productList = await Products.find()
    if (!productList) {
        res.status(500).json({ success: false })
    } else {
        res.render('user/home_page', { title: 'home_page', products: productList })
    }

})







router.get('/productDetails/:id', async (req, res) => {
    let id = req.params.id;
    Products.findById({ _id: id }).then((products) => {
        console.log(products)
        res.render('user/product_details', { title: 'Details', products })
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