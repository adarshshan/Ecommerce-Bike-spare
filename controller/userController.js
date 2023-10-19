const User = require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userOtpVerification = require('../models/userOtpVerification')

async function userHome(req, res) {
    const userList = await User.find({verified:true})
    if (!userList) {
        res.status(500).json({ success: false })
    }
    // res.send(userList)
    res.render('admin/users', {
        title: 'users',
        users: userList
    })
}

function loginPage(req, res) {
    if (req.session.userlogin) {
        res.redirect('/persons')
    } else {
        res.render('user/login', { title: 'User Login' })
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
                    console.log(`isuser: ${isuser}`)
                    if (isuser) {
                        req.session.userlogin = true
                        req.session.name = mail.name
                        res.redirect('/persons')
                    } else {
                        req.session.message = {
                            message: 'you Entered the wrong password.!',
                            type: 'warning'
                        }
                        return res.redirect('/users/login')
                    }
                } else {
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

async function userSignup(req, res) {
    try {
        const password = req.body.password
        const cpassword = req.body.cpassword
        const isuser = await User.findOne({ email: req.body.email })
        if (isuser !== null){
            req.session.message = {
                message: 'User with Entered Email address is already exists',
                type: 'warning'
            }
            return res.redirect('/users/signup')
        } 
        if (password === cpassword) {
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
        } else {
            req.session.message = {
                message: 'Passwords not matching',
                type: 'warning'
            }
            return res.redirect('/users/signup')
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
                        console.log('User verified successfully')
                        delete req.session.uesrid
                        return res.redirect('/persons')
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
        let { userId, email } = req.body
        if (!userId || !email) {
            throw Error('Empty user details are not allowed.')
        } else {
            //delete existing record and resend
            await userOtpVerification.deleteMany({ userId })
            sendOtpVerificationEmail({ _id: userId, email }, res)
        }
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: 'resend Otp verification failed.'
        })
    }
}

async function blockUser(req, res) {
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
}

async function unBlockUser(req, res) {
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
        req.session.uesrid = _id
        console.log('your session userid is:' + req.session.uesrid)
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

            }
        })

    } catch (error) {
        console.log(error)
        console.log('Error is at Catch ')

    }
}
module.exports = {
    userHome,
    loginPage,
    userLogin,
    userSignup,
    verifyOtp,
    resendOtp,
    blockUser,
    unBlockUser
}