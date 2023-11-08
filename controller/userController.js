const User = require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userOtpVerification = require('../models/userOtpVerification')
const notifier = require('node-notifier');
const path = require('path');
const cart = require('../models/cart');
const product = require('../models/product');



async function userHome(req, res) {
    try {
        const userList = await User.find({ verified: true }).sort({ name: 1 })
        if (!userList) {
            res.status(500).json({ success: false })
        }
        // res.send(userList)
        res.render('admin/users', {
            title: 'users',
            users: userList
        })
    } catch (error) {
        console.log('Error is at userHome ' + error)
    }

}

function loginPage(req, res) {
    try {
        if (req.session.userlogin) {
            res.redirect('/')
        } else {
            res.render('user/login', { title: 'User Login' })
        }
    } catch (error) {
        console.log('Error is at loginPage ' + error)
    }

}

async function userLogin(req, res) {
    try {
        let password = req.body.password
        if (req.body.email && password) {
            let mail = await User.findOne({ email: req.body.email })
            if (mail) {
                if (!mail.isDeleted) {
                    const isuser = await bcrypt.compare(password, mail.password)
                    if (isuser) {
                        req.session.userlogin = true
                        req.session.currentUserId = mail._id
                        if (req.session.cartId && req.session.cartId !== null) {
                            const cartdetails = await cart.findById(req.session.cartId)
                            let data
                            if (cartdetails) {
                                data = cartdetails.products
                            } else { return res.send('cart is not found in database') }
                            const isCart = await cart.findOne({ userId: req.session.currentUserId })
                            if (!isCart) {
                                let array = []
                                for (let i = 0; i < data.length; i++) {
                                    array[i] = {
                                        productId: data[i].productId,
                                        productName: data[i].productName,
                                        productPrice: data[i].productPrice,
                                        productImage: data[i].productImage,
                                        quantity: data[i].quantity
                                    }
                                }
                                console.log(array)
                                await cart.insertMany({
                                    userId: req.session.currentUserId,
                                    products: array
                                })
                                await cart.findByIdAndDelete(req.session.cartId)
                            } else {
                                for (let i = 0; i < data.length; i++) {
                                    await cart.findOneAndUpdate({ userId: req.session.currentUserId }, { $push: { products: { productId: data[i].productId, productName: data[i].productName, productPrice: data[i].productPrice, productImage: data[i].productImage, quantity: data[i].quantity } } })
                                }
                                await cart.findByIdAndDelete(req.session.cartId)
                            }



                        }
                        await product.updateMany({}, { $set: { cart: false } })
                        notifier.notify({
                            title: 'Notifications',
                            message: 'User logined successfully...',
                            icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                            sound: true,
                            wait: true
                        })
                        res.redirect('/')
                    } else {
                        req.session.message = {
                            message: 'you Entered the wrong password.!',
                            type: 'warning'
                        }
                        return res.redirect('/users/login')
                    }
                } else {
                    notifier.notify({
                        title: 'Notifications',
                        message: 'The user has been blocked by the Admin. Please try to connect with the help center to know more.',
                        icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                        sound: true,
                        wait: true
                    })
                    req.session.message = {
                        message: 'You were Blocked!',
                        type: 'danger'
                    }
                    return res.redirect('/users/login')

                }
            } else {
                req.session.message = {
                    message: 'Email is not matching',
                    type: 'warning'
                }
                return res.redirect('/users/login')
            }
        } else {
            req.session.message = {
                message: 'Input details must not be blank!',
                type: 'warning'
            }
            return res.redirect('/users/login')
        }

    } catch (err) {
        console.log(err)
        console.log('Somthing Error at post login')
    }
}

function userSignupPage(req, res) {
    try {
        res.render('user/signup', { title: 'user signUp' })
    } catch (error) {
        console.log(error)
    }
}

async function userSignup(req, res) {
    try {
        const password = req.body.password
        const cpassword = req.body.cpassword
        const name = req.body.name
        const mobile = req.body.phone
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const email = req.body.email
        const isuser = await User.findOne({ email: req.body.email })
        if (isuser !== null) {
            req.session.message = {
                message: 'User with Entered Email address is already exists',
                type: 'warning'
            }
            return res.redirect('/users/signup')
        } else if (name.length < 4 || name.length > 20) {
            req.session.message = {
                message: 'Name must be 4-20 characters',
                type: 'warning'
            }
            return res.redirect('/users/signup')
        } else if (mobile.length !== 10) {
            req.session.message = {
                message: 'phone number must be 10 numbers',
                type: 'warning'
            }
            return res.redirect('/users/signup')
        } else if (password.length < 8 || password.length > 20) {
            req.session.message = {
                message: 'password must be atleast 8 charectors!',
                type: 'warning'
            }
            return res.redirect('/users/signup')
        } else if (password !== cpassword) {
            req.session.message = {
                message: 'Passwords are not matching!!!',
                type: 'danger'
            }
            return res.redirect('/users/signup')
        } else if (!pattern.test(email)) {
            req.session.message = {
                message: `${email} is not a valid email address.`,
                type: 'danger'
            }
            return res.redirect('/users/signup')
        } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || ! /[!@#$%^&*]/.test(password)) {
            req.session.message = {
                message: `password is weak. please make a strong password.`,
                type: 'warning'
            }
            return res.redirect('/users/signup')
        }

        const hashedpassword = await bcrypt.hash(password, 10)
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedpassword,
            verified: false
        })
        const result = await user.save()

        const otpsent = sendOtpVerificationEmail(result, req, res)
        if (otpsent) {
            return res.render('user/otppage', { title: 'OTP Login page.', msg: '', type: '' })
        }

    } catch (error) {
        console.log(error)
        req.session.message = {
            message: 'Unknown Error occured!!!',
            type: 'danger'
        }
        return res.redirect('/users/signup')
    }
}

async function validateEmail(req, res) {
    try {
        const email = req.params.email
        const isuser = await User.findOne({ email: email })
        console.log(isuser)
        if (isuser && isuser !== null && isuser !== undefined) {
            console.log('Email is exist')
            return res.json({ success: true, message: 'Entered Email is already been using!' })
        } else {
            console.log('email is not exist')
            return res.json({ success: false, message: 'User with Email is not exist!' })
        }
    } catch (error) {
        console.log(error)
        console.log('An errror occured at validateEmail getreq...')
    }
}

async function verifyOtp(req, res) {
    try {
        let otp = req.body.otp
        let userId = req.session.uesrid
        console.log(`userId: ${userId} and otp: ${otp}`);
        if (!userId || !otp) {
            return res.render('user/otppage', { title: 'OTP Login page.', msg: 'Empty OTP details are not allowed.', type: 'danger' })
        } else {
            const userOtpVerificationRecords = await userOtpVerification.find({ userId })
            if (userOtpVerificationRecords.length <= 0) {
                //no records found
                return res.render('user/otppage', { title: 'OTP Login page.', msg: "Account records doesn't exist or has been verified already. Please sign up or log in", type: 'danger' })

            } else {
                //user otp record exists
                const { expired_at } = userOtpVerificationRecords[0]
                const hashedOtp = userOtpVerificationRecords[0].otp
                if (expired_at < Date.now()) {
                    //user otp record has expired 
                    await userOtpVerification.deleteMany({ userId })
                    return res.render('user/otppage', { title: 'OTP Login page.', msg: 'Code has expired. please request again.', type: 'danger' })
                    // throw new Error('Code has expired. please request again.')
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)

                    if (!validOtp) {
                        //supplied otp is wrong
                        return res.render('user/otppage', { title: 'OTP Login page.', msg: 'Invalid code passed. check your Inbox.', type: 'danger' })
                        // throw new Error('Invalid code passed. check your Inbox.')
                    } else {
                        //success
                        await User.updateOne({ _id: userId }, { verified: true })
                        await userOtpVerification.deleteMany({ userId })
                        // alert('Email verified successfully...')
                        notifier.notify({
                            title: 'Notifications',
                            message: 'Email Verified successfully ',
                            icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                            sound: true,
                            wait: true
                        })
                        return res.redirect('/users/login')
                    }
                }
            }
        }
    } catch (error) {
        delete req.session.uesrid
        return res.render('user/otppage', { title: 'OTP Login page.', msg: 'Somthing went wrong. Try again.', type: 'danger' })
    }
}

async function resendOtp(req, res) {
    try {
        console.log('Iam reached here...')
        let userId = req.session.uesrid
        let email = req.session.emailAddress
        console.log(`userid is ${userId} and email is ${email} checking...`)
        if (!userId || !email) {
            return res.render('user/otppage', { title: 'OTP Login page.', msg: "Empty user details are not allowed", type: 'danger' })
        } else {
            //delete existing record and resend
            await userOtpVerification.deleteMany({ userId })
            await sendOtpVerificationEmail({ _id: userId, email }, req, res)
        }
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: 'resend Otp verification failed.'
        })
    }
}

async function blockUser(req, res) {
    try {
        let id = req.params.id
        let user = await User.findOne({ _id: id })
        user.isDeleted = true;
        user.blocked_at = Date.now()
        user.save().then((rsult) => {
            res.redirect('/users')
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
    } catch (error) {
        console.log('Error is at blockUser ' + error)
    }

}

async function unBlockUser(req, res) {
    try {
        let id = req.params.id
        let user = await User.findOne({ _id: id })
        user.isDeleted = false;
        user.unBlocked_at = Date.now()
        user.save().then((result) => {
            res.redirect('/users')
        }).catch((err) => {
            console.log(err)
            res.send(err)
        })
    } catch (error) {
        console.log('Error is at unBlockUser ' + error)
    }

}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

//Send otp verification Email
const sendOtpVerificationEmail = async ({ _id, email }, req, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        //mail options
        const
            mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: 'verify your Email',
                html: `<p>Enter <b>${otp}</b> in the app to verify your email address.</p>
            <p>This code will <b>Expires in one hour</b></p>`
            }
        //hash the otp
        const saltrounds = 10
        req.session.emailAddress = email
        req.session.uesrid = _id
        const hashedOtp = await bcrypt.hash(otp, saltrounds);
        const newOtpVerification = await new userOtpVerification({
            userId: _id,
            otp: hashedOtp,
            created_at: Date.now(),
            expired_at: Date.now() + 3600000,
        })
        //save otp record
        await newOtpVerification.save()
        await transporter.sendMail(mailOptions, (err, res) => {
            if (err) {
                console.log(err)
            } else {
                notifier.notify({
                    title: 'Notifications',
                    message: 'OTP has send to your Email address. please check your Inbox. ',
                    icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                    sound: true,
                    wait: true
                })
            }
        })

    } catch (error) {
        console.log(error)
        console.log('Error is at Catch ')

    }
}
async function userLogout(req, res) {
    try {
        delete req.session.userlogin
        delete req.session.currentUserId
        delete req.session.cartId
        await product.updateMany({}, { $set: { cart: false } })
        res.redirect('/')
    } catch (error) {
        console.log('An Error occured when logging out ' + error)
    }

}
module.exports = {
    userHome,
    loginPage,
    userLogin,
    userSignupPage,
    userSignup,
    verifyOtp,
    resendOtp,
    blockUser,
    unBlockUser,
    userLogout,
    validateEmail
}