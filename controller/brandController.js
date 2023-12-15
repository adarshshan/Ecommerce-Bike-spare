const Brand = require('../models/brand')

async function brandHome(req, res) {
    try {
        const brandList = await Brand.find({ isDeleted: false }).sort({ name: 1 })
        res.render('admin/brands', {
            title: 'Brands',
            data: brandList
        })
    } catch (error) {
        console.log('Error is at brandHome' + error)
    }

}

async function addBrand(req, res) {
    try {
        const isBrand = await Brand.findOne({ $and: [{ name: req.body.name }, { isDeleted: false }] });
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if(specialChars.test(req.body.name)) return res.json({success:false,message:'Special charactors are not allowed!'})
        if (!req.body.name) return res.json({ success: false, message: 'Input field must not be blank!' });
        if (isBrand !== null) return res.json({ success: false, message: 'Entered Brand is already exists.' });
        if (req.body.name.length < 2 || req.body.name.length > 25) return res.json({ success: false, message: 'must have below 25 charactors.' });
        const brands = new Brand({
            name: req.body.name
        })
        brands.save()
            .then((brandCreated) => {
                return res.json({success:true,message:'New brand added successfully'})
            })
            .catch((err) => {
                return res.json({success:false,message:'Failed to add the new brand!'})
            })
    } catch (error) {
        console.log('Error is at addBrand' + error)
    }

}

function addBrandPage(req, res) {
    try {
        res.render('admin/add_brands', { title: 'add-brand', msg: '' })
    } catch (error) {
        console.log(error)
    }
}

async function deleteBrand(req, res) {
    try {
        let id = req.params.id
        const brand = await Brand.findById(id)
        brand.isDeleted = true
        brand.deleted_at = Date.now()
        brand.save().then((s) => {
            return res.json({success:true,message:'deleted'})
        }).catch((err) => {
            console.log(err)
            return res.json({success:false,message:'Failed to add new brand!'}) 
        })
    } catch (error) {
        console.log('Error is at deleteBrand ' + error)
        return res.json({success:'Somthing went wrong.'})
    }

}

function editBrand(req, res) {
    try {
        let id = req.params.id;
        Brand.findById(id).then((user) => {
            res.render('admin/edit_brand', {
                title: "Edit brand",
                data: user
            })
        })
            .catch((err) => {
                res.send(err);
            })
    } catch (error) {
        console.log('Error is at editBrand ' + error)
    }

}

function updateBrand(req, res) {
    try {
        let id = req.params.id
        Brand.find({ $and: [{ name: req.body.name }, { isDeleted: false }] }).count().then((resu) => {
            if (resu == 1 || resu == 2) {
                console.log(`numbers : ${resu}`)
                req.session.message = {
                    message: 'This name is already exist please try another one',
                    type: 'warning'
                }
                return res.redirect(`/brands/edit/${id}`)
            } else {
                Brand.findByIdAndUpdate(id, {
                    name: req.body.name
                }).then((user) => {
                    console.log(`numbers : ${resu}`)
                    return res.redirect('/brands')
                })
                    .catch((err) => {
                        return res.send(err)
                    })
            }
        })

    } catch (error) {
        console.log('Error is at updateBrand ' + error)
    }

}

module.exports = {
    brandHome,
    addBrand,
    deleteBrand,
    editBrand,
    updateBrand,
    addBrandPage
}