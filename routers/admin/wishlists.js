const express = require('express')
const router = express.Router()
const Wishlist = require('../../models/wishlist')

router.get('/', async (req, res) => {
    const wishlist = await Wishlist.find()

    res.send(wishlist)
})

router.post('/', (req, res) => {

})

module.exports = router