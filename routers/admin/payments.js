const express = require('express')
const router = express.Router()
const Payment = require('../../models/payment')

router.get('/', async (req, res) => {
    const paymentList = await Payment.find()

    res.send(paymentList)
})
router.post('/', (req, res) => {
    const payment = new Payment({

    })
    payment.save()
        .then((result) => {
            res.status(201).json(result)
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })
        })
})
router.delete('/', (req, res) => {

})

module.exports = router