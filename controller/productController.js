const Product = require('../models/product')
const Brand = require('../models/brand')
const Category = require('../models/categorie')




async function productHome(req, res) {
    productsPerPage = 5;
    try {
        const productList = await Product.find({ isDeleted: false }).sort({ crated_at: -1 })
            .populate({
                path: 'categorieId',
                select: 'name'
            }).populate({
                path: 'brandId',
                select: 'name'
            })

        if (!productList) {
            console.log('it is here')
            res.status(500).json({ success: false })
        }
        let page =parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productList.slice(start, end)
        // res.send(productList)
        res.render('admin/products.ejs', {
            title: 'Produts',
            data: paginatedProducts,
            currentPage: page,
            totalPages: Math.ceil(productList.length / productsPerPage)
        })
    } catch (error) {
        console.log('Error is at productHome ' + error)
    }

}

function addProduct(req, res) {
    try {
        let data = req.body
        const name = req.body.name
        if (!req.body.name || !req.body.brandId || !req.body.categorieId || !req.body.price || !req.body.stock || !req.body.description) {
            req.session.message = {
                message: 'Input fields must not be blank!',
                type: 'danger'
            }
            return res.redirect('/products/add')
        } else if (name.length < 2 || name.length > 40) {
            req.session.message = {
                message: 'The title name must be within 2-30 charachers',
                type: 'warning'
            }
            return res.redirect('/products/add')
        } else if (req.body.description.length < 10) {
            req.session.message = {
                message: 'The discription is too short.',
                type: 'warning'
            }
            return res.redirect('/products/add')
        } else if (!req.files.length) {
            req.session.message = {
                message: 'please add atleast one image!',
                type: 'warning'
            }
            return res.redirect('/products/add')
        }
        if (data !== null) {
            let arrayimage = []
            for (let i = 0; i < req.files.length; i++) {
                arrayimage[i] = req.files[i].filename
            }

            const product = new Product({
                name: req.body.name,
                brandId: req.body.brandId,
                categorieId: req.body.categorieId,
                price: req.body.price,
                stock: req.body.stock,
                description: req.body.description,
                image: arrayimage
            })
            product.save().then((createdProduct => {
                // res.status(201).json(createdProduct)

                req.session.message = {
                    type: 'success',
                    message: 'Product Add successfully.'
                }
                res.redirect('/products')
            }))
                .catch((err) => {
                    console.log('the problem is here')
                    res.status(500).json(console.log(err))
                })
        } else {
            res.redirect('/products/add')
        }
    } catch (error) {
        console.log('Error is at addProduct ' + error)
    }

}

async function addProdutPage(req, res) {
    try {
        let categorieList = await Category.find({ isDeleted: false });
        const viewData = {
            edit: false,
            categorieList

        }
        let brandList = await Brand.find({ isDeleted: false })
        const showData = {
            edit: false,
            brandList
        }
        res.render('admin/add_products', { viewData, showData, title: "add product" })
    } catch (error) {
        console.log('Error is at addProductPage ' + error)
    }

}

async function deleteProduct(req, res) {
    try {
        let id = req.params.id
        let product = await Product.findById(id)
        product.isDeleted = true;
        product.deleted_at = Date.now()
        product.save().then((result) => {
            res.redirect('/products')
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
    } catch (error) {
        console.log('Error is at deleteProduct' + error)
    }

}

async function updateProductpage(req, res) {
    try {
        let id = req.params.id
        let categorieList = await Category.find();
        const viewData = {
            edit: false,
            categorieList

        }
        let brandList = await Brand.find()
        const showData = {
            edit: false,
            brandList
        }
        const product = await Product.findById(id).populate({
            path: 'categorieId',
            select: 'name',
            select: '_id'
        }).populate({
            path: 'brandId',
            select: 'name',
            select: '_id'
        })
        const bid = await Product.findById({ _id: id }, { _id: 0, brandId: 1 })
        const cid = await Product.findById({ _id: id }, { _id: 0, categorieId: 1 })

        const bname = await Brand.find({ _id: bid.brandId }, { _id: 0, name: 1 });
        const cname = await Category.find({ _id: cid.categorieId }, { _id: 0, name: 1 });

        const brandid = bname[0]._id
        const categoryid = cname[0]._id
        res.render('admin/edit_product', { product, viewData, showData, title: 'edit_product', brandid: brandid, categoryid: categoryid })
    } catch (error) {
        console.log('Error is at updateProductPage ' + error)
    }


}

async function updateProduct(req, res) {
    try {
        let id = req.params.id;
        let name = req.body.name
        if (!req.body.name || !req.body.brandId || !req.body.categorieId || !req.body.price || !req.body.stock || !req.body.description) {
            req.session.message = {
                message: 'Input fields must not be blank!',
                type: 'danger'
            }
            return res.redirect(`/products/update/${id}`)
        } else if (name.length < 2 || name.length > 30) {
            req.session.message = {
                message: 'The title name must be within 2-30 charachers',
                type: 'warning'
            }
            return res.redirect(`/products/update/${id}`)
        } else if (req.body.description.length < 10) {
            req.session.message = {
                message: 'The discription is too short.',
                type: 'warning'
            }
            return res.redirect(`/products/update/${id}`)
        } else {
            let arrayimage = []
            for (let i = 0; i < req.files.length; i++) {
                arrayimage[i] = req.files[i].filename
            }
            const product = await Product.findById(id)
            let files = req.files
            // if(files){
            //     files.map(file=>{
            //         arrayimage.push(file.path)
            //     })
            // }
            console.log(arrayimage)
            const compimgpath = [...product.image, ...arrayimage]
            Product.findByIdAndUpdate(id, {
                name: req.body.name,
                brandId: req.body.brandId,
                categorieId: req.body.categorieId,
                price: req.body.price,
                stock: req.body.stock,
                description: req.body.description,
                image: compimgpath
            }).then(() => {
                req.session.message = {
                    message: 'Product updated successfully',
                    type: 'success'
                }
                res.redirect('/products')
            }).catch((err) => {
                console.log('The errror iss' + err)
            })

        }
    } catch (error) {
        console.log('Error is at updateProduct ' + error)
    }


}
async function deleteImage(req, res) {
    try {
        const id = req.params.id
        const image = req.params.image
        await Product.findByIdAndUpdate({ _id: id }, { $pull: { image: image } })
        req.session.message = {
            message: 'Image deleted successfully',
            type: 'success'
        }
        return res.redirect(`/products/update/${id}`);
    } catch (error) {
        console.log('Error is at deleteImage ' + error)
    }

}

module.exports = {
    productHome,
    addProduct,
    addProdutPage,
    deleteProduct,
    updateProductpage,
    updateProduct,
    deleteImage
}