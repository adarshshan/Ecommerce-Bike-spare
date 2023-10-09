const express = require('express')
const router = express.Router()
const UserDetail = require('../../models/userDetail')

router.get('/', async (req, res) => {
    const userDetailList = await UserDetail.find()

    res.send(userDetailList)
})

router.post('/', (req, res) => {
    const userDetail = new UserDetail({
        name: req.body.name,
        place: req.body.place,
        state: req.body.state
    })

    userDetail.save()
        .then((Created) => {
            res.status(201).json(Created)
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

module.exports = router;