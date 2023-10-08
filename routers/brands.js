const express = require('express')
const router = express.Router()
const Brand = require('../models/brand')

router.get('/', async (req, res) => {
    const brandList = await Brand.find()

    res.send(brandList)
})

router.post('/', (req, res) => {
    const brands = new Brand({
        name: req.body.name
    })
    brands.save()
        .then((brandCreated) => {
            res.status(201).json(brandCreated)
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })  
        })
})

module.exports = router