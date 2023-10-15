const express = require('express')
const router = express.Router()
const Admin = require('../../models/admin')
const bcrypt=require('bcrypt')

router.get('/login', (req, res) => {
    if (req.session.login) {
        res.redirect('/products')
    } else {
        res.render('admin/login')
    }
})
router.post('/login', async (req, res) => {
    try {
        const password = req.body.password
        const admin = await Admin.findOne({ email: req.body.email })
        if (admin) {
            await bcrypt.compare(password,admin.password).then((result)=>{
                console.log('look :'+result)
                req.session.name=admin.name
                req.session.login=true
                res.redirect('/products')
            }).catch((err)=>{
                console.log('Incorrect password.')
                console.log(err)
                res.redirect('/admin/login')
            })
            // if (admin.password === password) {
            //     req.session.login = true
            //     req.session.adminName = admin.name
            //     res.redirect('/products')
            // } else {
            //     console.log('Incorrect password...')
            //     res.redirect('/admin/login')
            // }
        } else {
            console.log('User is not exists')
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }

})
router.get('/signup', (req, res) => {
    res.render('admin/signup')
})
router.post('/signup', async (req, res) => {
    var pass
    await bcrypt.hash(req.body.password,10).then((hash)=>{
        pass=hash;
    }).catch((err)=>{
        console.log('An error occured while hashing the password'+err)
        res.redirect('/admin/signup')
    })
    const data = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: pass
    })
    await data.save().then((result) => {
        res.redirect('/products')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })

})
router.get('/logout', (req, res) => {
    try {
        req.session.login = false
        res.redirect('/admin/login')
    } catch (err) {
        res.send(err)
        console.log('An Error occured logging out...' + err)
    }
})


module.exports = router