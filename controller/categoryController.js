const Category = require('../models/categorie')
const Product = require('../models/product')

async function categoryHome(req, res) {
    try {
        const categorieList = await Category.find({ isDeleted: false }).sort({ name: 1 })
        res.render('admin/categories', {
            title: 'Categories',
            data: categorieList
        })
    } catch (error) {
        console.log(error)
        return redirect('/err-internal');
    }

}

async function addCategories(req, res) {
    try {
        const iscategory = await Category.findOne({ $and: [{ name: req.body.name }, { isDeleted: false }] })
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (!req.body.name) return res.json({ success: false, message: 'The input field must not be blank!' });
        if (req.body.name.length < 4) return res.json({ success: false, message: 'name should be atlest 4 charactors' });
        if (specialChars.test(req.body.name)) return res.json({ success: false, message: 'Special charactors are not accepted!' });
        if (iscategory !== null) return res.json({ success: false, message: 'Entered Category name is already exists!' });
        if (req.body.name.length < 2 || req.body.name.length > 25) return res.json({ success: false, message: 'category name must be below 25 charactors!' });
        const categorie = new Category({
            name: req.body.name
        })
        categorie.save()
            .then(() => {
                console.log(`category added successfully`);
                return res.json({ success: true, message: 'Category added successfully!' });
            })
            .catch((err) => {
                console.log(err)
                return res.json({ success: false, message: 'Failed to added category!' });
            })
    } catch (error) {
        console.log('error at addcategory' + error)
        return res.json({ success: false, err: true })
    }

}

function addCategoryPage(req, res) {
    try {
        res.render('admin/add_categories', { title: 'add-category', msg: '' })
    } catch (error) {
        console.log(error)
        return res.redirect('/err-internal');
    }
}

async function deleteCategory(req, res) {
    try {
        let id = req.params.id;
        const category = await Category.findById(id)
        category.isDeleted = true
        category.deleted_at = Date.now();
        category.save().then((result) => {
            return res.json({ success: true, message: 'category deleted.' })
        }).catch((err) => {
            console.log(err)
            return res.json({ success: false, message: 'Failed to deleted.' })
        })
    } catch (error) {
        console.log('Error is at deleteCategory ' + error)
        return res.json({ success: false, err: true });
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
        return res.redirect('/err-internal');
    }

}

function updateCategory(req, res) {
    try {
        let id = req.params.id
        Category.find({ $and: [{ name: req.body.name }, { isDeleted: false }] }).count().then((result) => {
            if (result == 1 || result == 2) {
                console.log(`result is${result}`)
                req.session.message = {
                    message: 'The entered name is already exixt in the list. Please try another one.',
                    type: 'warning'
                }
                return res.redirect(`/categories/edit/${id}`)
            } else {
                console.log(`result${result}`)
                Category.findByIdAndUpdate(id, {
                    name: req.body.name
                }).then((result) => {
                    res.redirect('/categories')
                }).catch((err) => {
                    res.send(err)
                })
            }

        })

    } catch (error) {
        console.log('Error is at updateCategory ' + error)
        return res.redirect('/err-internal');
    }

}
module.exports = {
    categoryHome,
    addCategories,
    deleteCategory,
    editCategory,
    updateCategory,
    addCategoryPage
}