const User = require('../../models/user');
const express = require('express')
const router = express.Router()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


router.get('/', async (req, res) => {
    const userList = await User.find()
    if (!userList) {
        res.status(500).json({ success: false })
    }
    // res.send(userList)
    res.render('admin/users', {
        title: 'users',
        users: userList
    })
})

router.get('/login', (req, res) => {
    if (req.session.logined) {
        res.redirect('/persons')
    } else {
        res.render('user/login', { title: 'User Login' })
    }

})

router.get('/signup', (req, res) => {
    res.render('user/signup', { title: 'user signUp' })
})

router.post('/login', async (req, res) => {
    try {

        let password = req.body.password
        let mail = await User.findOne({ email: req.body.email })
        if (!mail.isDeleted) {
            if (mail) {
                bcrypt.compare(password,mail.password).then((result)=>{
                    req.session.logined=true
                    req.session.name=mail.name
                    console.log(result+' your password name')
                    res.redirect('/persons')
                }).catch((err)=>{
                    res.send(err)
                    console.log('An Error occured at bcrypt comparing.')
                })
            } else {
                res.send('Email is not matching')
            }
        }else{
            res.send('You were Blocked!')
        }



    } catch (err) {
        console.log(err)
        console.log('Somthing Error at post login')
    }


    // try {
    //     const email = req.body.email
    //     const password = req.body.password
    //     const userMail = await User.findOne({ email: email })
    //     const isMatch = await bcrypt.compare(password, userMail.password)
    //     const token = await userMail.generateAuthToken()
    //     console.log('token Part' + token)
    //     if (isMatch) {
    //         res.status(201).redirect('/persons')
    //     } else {
    //         res.send('invalid password Details.')
    //     }
    // } catch (error) {
    //     res.status(400).send('invalid login details')
    // }
})

router.post('/', async (req, res) => {
    try {
        var pass
        const password = req.body.password
        const cpassword = req.body.cpassword
        const hashpass=await bcrypt.hash(password,10).then((hash)=>{
            pass=hash
            console.log('hashed password: '+hash)
        }).catch((err)=>{
            console.log('Error is at users post')
            res.send(err)
        })
        
        if (password === cpassword) {
            let user = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: pass
            }
            await User.insertMany([user])
            res.redirect('/users/login')

        } else {
            res.send('you entered different passwords.')
        }

    } catch (err) {
        console.log(err)
        res.send(err)
    }
})


// try {
//     const password = req.body.password
//     const cpassword = req.body.cpassword
//     if (password === cpassword) {
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             password: req.body.password,
//             token,
//             cpassword: req.body.cpassword

//         })
//         console.log('success part' + user)
//         const token = await user.generateAuthToken()
//         console.log('token part' + token);
//         const userlist = await user.save()
//         console.log('token page' + userlist);
//         res.status(201).redirect('/usersignup/loginuser')
//     } else {
//         res.send('password are not matching')
//     }
// } catch (error) {
//     console.log(error)
//     res.status(400).send(error)
// }

// })



router.get('/block/:id', async (req, res) => {
    let id = req.params.id
    let user = await User.findOne({ _id: id })
    user.isDeleted = true;
    user.blocked_at = Date.now()
    await user.save().then((rsult) => {
        res.redirect('/users')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})
router.get('/unblock/:id', async (req, res) => {
    let id = req.params.id
    let user = await User.findOne({ _id: id })
    user.isDeleted = false;
    user.unBlocked_at = Date.now()
    await user.save().then((result) => {
        res.redirect('/users')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })


})

module.exports = router;