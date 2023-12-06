const express = require('express')
const router = express.Router()
const controller=require('../../controller/adminController')


router.get('/login',controller.adminLoginPage )
router.post('/login',controller.adminLogin)
router.post('/signup',controller.adminSignup)
router.get('/logout',controller.adminLogout)


module.exports = router