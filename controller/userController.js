const User=require('../models/user')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userOtpVerification = require('../models/userOtpVerification')

async function userHome(req,res){
    const userList = await User.find()
    if (!userList) {
        res.status(500).json({ success: false })
    }
    // res.send(userList)
    res.render('admin/users', {
        title: 'users',
        users: userList
    })
}

function loginPage(req,res){
    if (req.session.userlogin) {
        res.redirect('/persons')
    } else {
        res.render('user/login', { title: 'User Login' })
    }
}

async function userLogin(req,res){
    try {

        let password = req.body.password
        let mail = await User.findOne({ email: req.body.email })
        if (!mail.isDeleted) {
            if (mail) {
                bcrypt.compare(password, mail.password).then((result) => {
                    req.session.userlogin = true
                    req.session.name = mail.name
                    console.log(result + ' your password name')
                    res.redirect('/persons')
                }).catch((err) => {
                    res.send(err)
                    console.log('An Error occured at bcrypt comparing.')
                })
            } else {
                res.send('Email is not matching')
            }
        } else {
            res.send('You were Blocked!')
        }



    } catch (err) {
        console.log(err)
        console.log('Somthing Error at post login')
    }
}

async function userSignup(req,res){
    try {
        const password = req.body.password
        const cpassword = req.body.cpassword
        const isuser = await User.findOne({ email: req.body.email })
        console.log(isuser)
        if (isuser !== null) return res.send('User with Entered Email address is already exists')
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
                // const userDetails=await User.find({user})
                // console.log(userDetails)
                return res.render('user/otppage', { title: 'OTP Login page.' })
            }
        } else {
            console.log('Passwords not matching')
        }
    } catch (error) {
        console.log('An Error occured at post signup')
        console.log(error)
    }
}

async function verifyOtp(req,res){
    try {
        let otp = req.body.otp
        let userId = req.session.uesrid
        delete req.session.uesrid
        console.log(`userId: ${userId} and otp: ${otp}`);
        if (!userId || !otp) {
            throw Error('Empty otp details are not allowed')
        } else {
            const userOtpVerificationRecords = await userOtpVerification.find({ userId })
            if (userOtpVerificationRecords.length <= 0) {
                //no records found
                throw new Error("Account records doesn't exist or has been verified already. Please sign up or log in")
            } else {
                //user otp record exists
                const { expired_at } = userOtpVerificationRecords[0]
                const hashedOtp = userOtpVerificationRecords[0].otp
                if (expired_at < Date.now()) {
                    //user otp record has expired 
                    await userOtpVerification.deleteMany({ userId })
                    throw new Error('Code has expired. please request again.')
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)

                    if (!validOtp) {
                        //supplied otp is wrong
                        throw new Error('Invalid code passed. check your Inbox.')
                    } else {
                        //success
                        await User.updateOne({ _id: userId }, { verified: true })
                        await userOtpVerification.deleteMany({ userId })
                        console.log('User verified successfully')
                        res.redirect('/persons')
                    }
                }
            }
        }
    } catch (error) {
        res.send('somthing error at catch block')
    }
}

async function resendOtp(req,res){
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

async function unBlockUser (req, res) {
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
module.exports={
    userHome,
    loginPage,
    userLogin,
    userSignup,
    verifyOtp,
    resendOtp,
    blockUser,
    unBlockUser
}