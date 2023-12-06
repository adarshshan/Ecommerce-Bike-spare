const Admin = require('../models/admin')
const bcrypt = require('bcrypt')

function adminLoginPage(req, res) {
    try {
        if (req.session.login) {
            res.redirect('/products')
        } else {
            res.render('admin/login')
        }
    } catch (error) {
        console.log('Error is at adminLoginPage ' + error)
    }

}

async function adminLogin(req, res) {
    try {
        const password = req.body.password
        if (req.body.email && password) {
            const admin = await Admin.findOne({ email: req.body.email })
            if (admin) {
                const ismatch = await bcrypt.compare(password, admin.password);
                if (ismatch) {
                    req.session.name = admin.name
                    req.session.adminId=admin._id;
                    req.session.login = true
                    res.redirect('/dashboard')
                } else {
                    req.session.message = {
                        message: 'You entered the wrong password.',
                        type: 'danger'
                    }
                    res.redirect('/admin/login')
                }
                // await bcrypt.compare(password,admin.password).then((result)=>{
                //     req.session.name=admin.name
                //     req.session.login=true
                //     res.redirect('/products')
                // }).catch((err)=>{
                //     console.log('Incorrect password.')
                //     console.log(err)
                //     res.redirect('/admin/login')
                // })
            } else {
                req.session.message = {
                    message: 'Admin with entered email is not exsts',
                    type: 'warning'
                }
                res.redirect('/admin/login')
            }
        } else {
            req.session.message = {
                message: 'The input field must not be blank!',
                type: 'warning'
            }
            res.redirect('/admin/login')
        }

    } catch (error) {
        console.log(error)
        req.session.message = {
            message: '!Unknown error!',
            type: 'danger'
        }
        res.redirect('/admin/login')
    }

}

async function adminSignup(req, res) {
    try {
        const pass=await bcrypt.hash(req.body.password, 10)
        console.log(`the result is ${pass}`)
        const data = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: pass
        })
        await data.save().then((result) => {
            res.redirect('/products')
        }).catch((err) => {
            console.log('The error is here'+err)
            res.send(err)
        })
    } catch (error) {
        console.log('Error is at adminSignup ' + error)
    }


}

function adminLogout(req, res) {
    try {
        delete req.session.login
        res.redirect('/admin/login')
    } catch (err) {
        res.send(err)
        console.log('An Error occured logging out...' + err)
    }
}

module.exports = {
    adminLoginPage,
    adminLogin,
    adminSignup,
    adminLogout
}