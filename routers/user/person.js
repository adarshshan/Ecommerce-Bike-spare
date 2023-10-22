const express = require('express')
const router = express.Router()
const Products = require('../../models/product')
const User = require('../../models/user')
const Brand = require('../../models/brand')
const bcrypt = require('bcrypt')
const categorie = require('../../models/categorie')

router.get('/', async (req, res) => {
    try {
        if (req.session.uesrid) {
            delete req.session.uesrid
        }
        const productsPerPage = 9
        let productList = await Products.find({ isDeleted: false }).sort({ created_at: -1 })
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productList.slice(start, end)
        if (!productList) {
            res.status(500).json({ success: false })
        } else {
            res.render('user/home_page', {
                title: 'home_page',
                products: paginatedProducts,
                currenPage: page,
                totaPages: Math.ceil(productList.length / productsPerPage)
            })
        }
    } catch (error) {
        console.log("An Error occured at rendering the user home page..." + error)
    }


})

router.get('/productDetails/:id', async (req, res) => {
    try {
        let id = req.params.id;
        imgUri = process.env.IMG_URI
        const bid = await Products.findById({ _id: id }, { _id: 0, brandId: 1 })
        const cid = await Products.findById({ _id: id }, { _id: 0, categorieId: 1 })

        const bname = await Brand.find({ _id: bid.brandId }, { _id: 0, name: 1 });
        const cname = await categorie.find({ _id: cid.categorieId }, { _id: 0, name: 1 });

        const brandName = bname[0].name
        const categoryName = cname[0].name
        Products.findById({ _id: id }).then((products) => {
            res.render('user/product_details', { title: 'Details', products, imgUri, brandName, categoryName })
        }).catch((err) => {
            res.redirect('/persons')
            console.log(err)
            console.log('Error is at get productDetails')
        })
    } catch (error) {
        console.log('An Error occured when Rendering the product Details...')
    }
})

module.exports = router