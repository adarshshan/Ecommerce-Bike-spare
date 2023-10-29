const express = require('express')
const router = express.Router()
const Cart = require('../../models/cart')
const product = require('../../models/product')
const notifier = require('node-notifier');
const path = require('path')
const controller = require('../../controller/cartController')

router.get('/', controller.cartHome)

router.post('/add/:id', controller.addCart)

router.get('/remove/:id', controller.removeCart)

router.get('/increaseCount/:id',controller.increaseCount)

router.get('/decreaseCount/:id',controller.decreaseCount)





module.exports = router