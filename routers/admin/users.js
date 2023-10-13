const User = require('../../models/user');
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    const userList = await User.find()
    if (!userList) {
        res.status(500).json({ success: false })
    }
    // res.send(userList)
    res.render('admin/users',{
        title:'users',
        users:userList
    })
})
router.post('/', (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
    })

    user.save().then(Usercreated => {
        res.status(201).json(Usercreated)
    })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false
            })
        })

})
router.get('/block/:id',async (req,res)=>{
    let id=req.params.id
    let user= await User.findOne({_id:id})
    user.isDeleted=true;
    await user.save().then((rsult)=>{
        res.redirect('/users')
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })
})
router.get('/unblock/:id',async (req,res)=>{
    let id=req.params.id
    let user=await User.findOne({_id:id})
    user.isDeleted=false;
    await user.save().then((result)=>{
        res.redirect('/users')
    }).catch((err)=>{
        console.log(err)
        res.send(err)
    })


})

module.exports = router;