const express = require('express')
const router = express.Router()
const Order = require('../../models/order')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const controller=require('../../controller/orderController')
const adminAuth=require('../../middlware/adminAuth')

router.use(adminAuth)

router.get('/',controller.adminOrderList)
router.get('/view_order/:id/:Tamount/:Pmethod/:aName/:aPhone/:date',controller.adminViewOrder)

module.exports = router