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
        let page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productList.slice(start, end)
        // res.send(productList)
        // res.render('admin/products.ejs', {
        //     title: 'Produts',
        //     data: paginatedProducts,
        //     currentPage: page,
        //     totalPages: Math.ceil(productList.length / productsPerPage)
        // })
        res.render('admin/products.ejs', { title: 'Produts', data: productList })
    } catch (error) {
        console.log('Error is at productHome ' + error)
    }

}

function addProduct(req, res) {
    try {
        const name = req.body.name
        const specialChars = /[`!@#$%^&*_+\=\[\]{};':"\\|,<>\/?~]/;
        if (!req.body.name || !req.body.brandId || !req.body.categorieId || !req.body.price || !req.body.stock || !req.body.description) return res.json({ success: false, message: 'Input fields must not be blank!' });
        if (specialChars.test(name)) return res.json({ success: false, message: 'Special charactors are not allowed for product name!' })
        if (name.length < 2 || name.length > 40) return res.json({ success: false, message: 'The title name must be within 2-30 charactors!' });
        if (req.body.description.length < 10) return res.json({ success: false, message: 'The discription is too short.' });
        if (!req.files.length) return res.json({ success: false, message: 'please add atleast one image!' });
        if (req.body.price < 1) return res.json({ success: false, message: 'Price must not be less than 1 rupee.' });
        if (req.body.stock < 0) return res.json({ success: false, message: 'Stock must not be less than zero!' });
        if (req.body.discount < 0 || req.body.discount > 100) return res.json({ success: false, message: 'Discount must be within 0 - 100%' })

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
            discount: req.body.discount,
            description: req.body.description,
            image: arrayimage
        })
        product.save().then((createdProduct => {
            res.json({ success: true, message: 'successfully add the product.' })
        }))
            .catch((err) => {
                console.log('the problem is here')
                return res.json({ success: false, message: 'Failed to add the product.' })
            })
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
            return res.json({success:true,message:'Product deleted.'})
        }).catch((err) => {
            console.log(err)
            return res.json({success:false,message:'Failed to deleted.'})
        })
    } catch (error) {
        console.log('Error is at deleteProduct' + error)
    }

}

async function updateProductpage(req, res) {
    try {
        let id = req.params.id
        let categorieList = await Category.find({ isDeleted: false });
        let brandList = await Brand.find({ isDeleted: false })
        const product = await Product.findById(id).populate('categorieId').populate('brandId');
        res.render('admin/edit_product', {
            product,
            categorieList,
            brandList,
            title: 'edit_product'
        })
    } catch (error) {
        console.log('Error is at updateProductPage ' + error)
    }


}

async function updateProduct(req, res) {
    try {
        console.log(`its here boy`);
        let id = req.params.id;
        let name = req.body.name
        console.log(req.body)
        console.log(req.files)
        const specialChars = /[`!@#$%^&*_+\=\[\]{};':"\\|,<>\/?~]/;
        if (!req.body.name || !req.body.brandId || !req.body.categorieId || !req.body.price || !req.body.stock || !req.body.description) return res.json({ success: false, message: 'Input fields must not be blank!' });
        if (specialChars.test(name)) return res.json({ success: false, message: 'Special charactors are not allowed for product name!' })
        if (name.length < 2 || name.length > 40) return res.json({ success: false, message: 'The title name must be within 2-30 charactors!' });
        if (req.body.description.length < 10) return res.json({ success: false, message: 'The discription is too short.' });
        if (req.body.price < 1) return res.json({ success: false, message: 'Price must not be less than 1 rupee.' });
        if (req.body.stock < 0) return res.json({ success: false, message: 'Stock must not be less than zero!' });
        if (req.body.discount < 0 || req.body.discount > 100) return res.json({ success: false, message: 'Discount must be within 0 - 100%' })

        const product = await Product.findById(id)
        var compimgpath = [...product.image]
        let arrayimage = []
        if (req.files.length) {
            for (let i = 0; i < req.files.length; i++) {
                arrayimage[i] = req.files[i].filename
            }
            var compimgpath = [...product.image, ...arrayimage]
        }
        console.log(arrayimage);


        Product.findByIdAndUpdate(id, {
            name: req.body.name,
            brandId: req.body.brandId,
            categorieId: req.body.categorieId,
            price: req.body.price,
            stock: req.body.stock,
            discount: req.body.discount,
            description: req.body.description,
            image: compimgpath
        }).then(() => {
            return res.json({ success: true, message: 'Product updated successfully...' })
        }).catch((err) => {
            return res.json({ success: false, message: 'Failed to update the Product' });
        })

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