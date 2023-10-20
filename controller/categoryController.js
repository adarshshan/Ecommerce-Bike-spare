const Category = require('../models/categorie')
const Product = require('../models/product')

async function categoryHome(req, res) {
    try {
        const categorieList = await Category.find({ isDeleted: false })
        res.render('admin/categories', {
            title: 'Categories',
            data: categorieList
        })
    } catch (error) {
        console.log(error)
    }

}

async function addCategories(req, res) {
    try {
        const iscategory = await Category.findOne({ name: req.body.name })
        if (!req.body.name) {
            return res.render('admin/add_categories', { title: 'aaai', msg: 'The input field must not be blank!' })
        } else if (iscategory !== null) {
            return res.render('admin/add_categories', { title: 'aaai', msg: 'Entered Category name is already exists' })
        } else if (req.body.name.length < 2 || req.body.name.length > 25) {
            return res.render('admin/add_categories', { title: 'aaai', msg: 'category name must be below 25 charactors!' })
        }
        const categorie = new Category({
            name: req.body.name
        })
        categorie.save()
            .then((categorieCreated) => {
                // res.status(201).json(categorieCreated)
                req.session.message = {
                    type: 'success',
                    message: 'Product Add successfully.'
                }
                res.redirect('/categories')
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                    success: false
                })
            })
    } catch (error) {
        console.log('error at addcategory' + error)
    }

}

async function deleteCategory(req, res) {
    try {
        let id = req.params.id;
        const category = await Category.findById(id)
        category.isDeleted = true
        category.deleted_at = Date.now();
        await category.save().then((result) => {
            res.redirect('/categories')
        }).catch((err) => {
            res.send(err)
            console.log(err)
        })
    } catch (error) {
        console.log('Error is at deleteCategory ' + error)
    }

}

function editCategory(req, res) {
    try {
        let id = req.params.id;
        Category.findById(id).then((coll) => {
            res.render('admin/edit_categorie', {
                title: 'edit_categories',
                data: coll
            })
        })
    } catch (error) {
        console.log('error is at editCategory' + error)
    }

}

function updateCategory(req, res) {
    try {
        let id = req.params.id
        Category.findByIdAndUpdate(id, {
            name: req.body.name
        }).then((result) => {
            res.redirect('/categories')
        }).catch((err) => {
            res.send(err)
        })
    } catch (error) {
        console.log('Error is at updateCategory ' + error)
    }

}
module.exports = {
    categoryHome,
    addCategories,
    deleteCategory,
    editCategory,
    updateCategory
}