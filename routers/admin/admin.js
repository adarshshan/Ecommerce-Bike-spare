const express = require('express')
const router = express.Router()
const Admin = require('../../models/admin')
const bcrypt=require('bcrypt')
const controller=require('../../controller/adminController')


router.get('/login',controller.adminLoginPage )

router.post('/login',controller.adminLogin)

router.get('/signup', (req, res) => {
    res.render('admin/signup')
})

router.post('/signup',controller.adminSignup)

router.get('/logout',controller.adminLogout)


module.exports = router