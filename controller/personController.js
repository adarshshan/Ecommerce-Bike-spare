const Products = require('../models/product')
const User = require('../models/user')
const Brand = require('../models/brand')
const categorie = require('../models/categorie')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userOtpVerification = require('../models/userOtpVerification')
const notifier = require('node-notifier');
const path = require('path');



async function personHome(req, res) {
    try {
        if (req.session.uesrid) {
            delete req.session.uesrid
        }
        const userId = req.session.currentUserId;
        const productsPerPage = 9
        let productList = await Products.find({ isDeleted: false }).sort({ created_at: -1 })
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productList.slice(start, end)
        if (!productList) {
            res.status(500).json({ success: false })
        } else {
            if (userId && userId !== null && userId !== undefined){
                const user=await User.findById(userId)
                var wishlist=user.wishlist

            }
                res.render('user/home_page', {
                    title: 'home_page',
                    products: paginatedProducts,
                    currenPage: page,
                    totaPages: Math.ceil(productList.length / productsPerPage),
                    wishlist
                })
        }
    } catch (error) {
        console.log("An Error occured at rendering the user home page..." + error)
    }


}

async function userDetailHome(req, res) {
    try {
        let id = req.params.id;
        imgUri = process.env.IMG_URI
        const bid = await Products.findById({ _id: id }, { _id: 0, brandId: 1 })
        const cid = await Products.findById({ _id: id }, { _id: 0, categorieId: 1 })

        const bname = await Brand.find({ _id: bid.brandId }, { _id: 0, name: 1 });
        const cname = await categorie.find({ _id: cid.categorieId }, { _id: 0, name: 1 });

        const brandName = bname[0].name
        const categoryName = cname[0].name
        Products.findById({ _id: id }).then((products) => {
            res.render('user/product_details', { title: 'Details', products, imgUri, brandName, categoryName })
        }).catch((err) => {
            res.redirect('/persons')
            console.log(err)
            console.log('Error is at get productDetails')
        })
    } catch (error) {
        console.log('An Error occured when Rendering the product Details...')
    }
}

async function profilePage(req, res) {
    const userId = req.session.currentUserId
    if (userId) {
        const user = await User.findById(userId)
        res.render('user/profile.ejs', { title: 'Profile', user })
    } else {
        console.log('User did not logged in.')
    }

}

async function changeName(req, res) {
    try {
        const name = req.params.name
        console.log('yea Iam reached here.')
        console.log(`name is ${name}`)
        const updated = await User.findByIdAndUpdate(req.session.currentUserId, { $set: { name: name } })
        if (updated) {
            console.log('Name updated.')
            return res.json({ success: true, message: 'name updated' })
        } else {
            console.log('FAiled to update.')
            return res.json({ success: false, message: 'name updation failed' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'name updation failed false' })
    }
}

async function changePhone(req, res) {
    try {
        const phone = req.params.phone
        const ph = parseInt(phone)
        console.log('your new phone number is ' + phone)
        const updated = await User.findByIdAndUpdate(req.session.currentUserId, { $set: { phone: ph } })
        if (updated) {
            console.log('Phone Number updated.')
            return res.json({ success: true, message: 'Phone number updated successfully.' })
        } else {
            console.log('phone number FAiled to update.')
            return res.json({ success: false, message: 'Phone number updation Failed..' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Phone number updation Failed..(false)' })
    }
}

async function changeEmail(req, res) {
    try {
        const email = req.params.email
        req.session.newEmail = email
        const isEmail = await User.findOne({ email: email })
        const userId = req.session.currentUserId
        const currentUser = await User.findById(userId)
        const id = currentUser._id
        const user = {
            _id: userId,
            email: email

        }
        console.log(`there are ${isEmail} numbers`)
        if (!isEmail) {
            await sendOtpVerificationEmail(user, req, res).then((result) => {
                try {
                    console.log('otp has been sent to your Email')
                    return res.json({ success: true, message: 'Otp has been sent to your Email address.' })
                } catch (error) {
                    console.log(error)
                }

            })
        } else {
            console.log('You provided Email is already been using ...')
            return res.json({ success: false, message: 'You provided Email is already using!' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' })
    }
}

function otpPage(req, res) {
    res.render('user/otppage_1', { title: 'OTP Change password.', msg: '', type: '' })
}

async function verifyOtpPost(req, res) {
    try {
        const newEmail = req.session.newEmail
        let otp = req.body.otp
        let userId = req.session.uesrid
        console.log(`userId: ${userId} and otp: ${otp}`);
        if (!userId || !otp) {
            return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Empty OTP details are not allowed.', type: 'danger' })
        } else {
            const userOtpVerificationRecords = await userOtpVerification.find({ userId })
            if (userOtpVerificationRecords.length <= 0) {
                //no records found
                return res.render('user/otppage_1', { title: 'OTP Login page.', msg: "Account records doesn't exist or has been verified already. Please sign up or log in", type: 'danger' })

            } else {
                //user otp record exists
                const { expired_at } = userOtpVerificationRecords[0]
                const hashedOtp = userOtpVerificationRecords[0].otp
                if (expired_at < Date.now()) {
                    //user otp record has expired 
                    await userOtpVerification.deleteMany({ userId })
                    return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Code has expired. please request again.', type: 'danger' })
                    // throw new Error('Code has expired. please request again.')
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)

                    if (!validOtp) {
                        //supplied otp is wrong
                        return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Invalid code passed. check your Inbox.', type: 'danger' })
                    } else {
                        //success
                        // await User.updateOne({ _id: userId }, { verified: true })
                        await userOtpVerification.deleteMany({ userId })
                        const updated = await User.findByIdAndUpdate(req.session.currentUserId, { $set: { email: newEmail } })
                        console.log(`updatedddd   is ${updated}`)
                        notifier.notify({
                            title: 'Notifications',
                            message: 'Email Verified successfully ',
                            icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                            sound: true,
                            wait: true
                        })
                        return res.redirect('/profile')
                    }
                }
            }
        }
    } catch (error) {
        delete req.session.uesrid
        return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Somthing went wrong. Try again.', type: 'danger' })
    }
}

async function changePassword(req, res) {
    console.log('yess iam reached here,....')
    try {
        const oldPassword = req.params.old
        const newPassword = req.params.new
        console.log(`oldpassword : ${oldPassword}  and new one is ${newPassword}`)
        const currentUser = await User.findById(req.session.currentUserId)
        const oldpass = currentUser.password
        const isTrue = await bcrypt.compare(oldPassword, oldpass)
        if (isTrue) {
            const hashedpassword = await bcrypt.hash(newPassword, 10)
            if (hashedpassword) {
                const setpass = await User.findByIdAndUpdate(req.session.currentUserId, { $set: { password: hashedpassword } })
                if (setpass) {
                    console.log('password successfully updated.')
                    return res.json({ success: true, message: 'password updated successfully' })
                } else {
                    console.log('Password Failed to update.')
                    return res.json({ success: false, message: 'Password Failed to update.' })
                }
            } else {
                console.log('Somthing went wrong while hashing the password.')
                return res.json({ success: false, message: 'Somthing went wrong while hashing the password.' })
            }
        } else {
            console.log("Old password doesn't match")
            return res.json({ success: false, message: 'Old password doesn`t match.' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' })
    }
}

function forgotPasswordPage(req, res) {
    try {
        res.render('user/forgotpage.ejs', { title: 'forgot Password' })
    } catch (error) {
        console.log(error)
    }
}

async function forgotPasswordOtpSent(req, res) {
    const userEmail = req.params.email
    req.session.forgetpasswordEmail = userEmail
    const isuser = await User.findOne({ email: userEmail });
    console.log(isuser)
    if (isuser) {
        const userId = isuser._id
        const user = {
            _id: userId,
            email: userEmail
        }
        console.log(`your userId is ${userId}.`)
        await sendOtpVerificationEmail(user, req, res).then((result) => {
            try {
                console.log('otp has been sent to your Email')
                return res.json({ success: true, message: 'Otp has been sent to your Email address.' })
            } catch (error) {
                console.log(error)
                return res.json({ success: false, message: 'Unknown Errror' })
            }

        })
    } else {
        console.log('Entered Email is not exist')
        return res.json({ success: false, message: 'Entered Email is not exist' })
    }
}

async function forgotOtpPage(req, res) {
    try {
        res.render('user/otppage_forgot.ejs', { title: 'forgot' })
    } catch (error) {
        console.log(error)
    }
}

async function verifyForgotPost(req, res) {
    try {
        const newEmail = req.session.newEmail
        const { otp } = req.body
        // const otp=req.params.otp
        let userId = req.session.uesrid
        console.log(`userId: ${userId} and otp: ${otp}`);
        if (!userId || !otp) {
            // return res.json({success:false,message:'Empty OTP details are not allowed.'})
            return res.render('user/otppage_forgot', { title: 'OTP Login page.', msg: 'Empty OTP details are not allowed.', type: 'danger' })
        } else {
            const userOtpVerificationRecords = await userOtpVerification.find({ userId })
            if (userOtpVerificationRecords.length <= 0) {
                // return res.json({success:false,message:'Account records doesn`t exist or has been verified already. Please sign up or log in'})
                return res.render('user/otppage_forgot', { title: 'OTP Login page.', msg: "Account records doesn't exist or has been verified already. Please sign up or log in", type: 'danger' })

            } else {
                const { expired_at } = userOtpVerificationRecords[0]
                const hashedOtp = userOtpVerificationRecords[0].otp
                if (expired_at < Date.now()) {
                    await userOtpVerification.deleteMany({ userId })
                    // return res.json({success:false,message:'Code has expired. please request again.'})
                    return res.render('user/otppage_forgot', { title: 'OTP Login page.', msg: 'Code has expired. please request again.', type: 'danger' })
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp)

                    if (!validOtp) {
                        // return res.json({success:false,message:'Invalid code passed. check your Inbox.'})
                        return res.render('user/otppage_forgot', { title: 'OTP Login page.', msg: 'Invalid code passed. check your Inbox.', type: 'danger' })
                    } else {
                        await userOtpVerification.deleteMany({ userId })
                        notifier.notify({
                            title: 'Notifications',
                            message: 'Email Verified successfully ',
                            icon: path.join(__dirname, 'public/assets/sparelogo.png'),
                            sound: true,
                            wait: true
                        })
                        // return res.json({success:true,message:'Email verified successfully.'})
                        return res.render('user/newpassword.ejs', { title: 'newpassword' });
                    }
                }
            }
        }
    } catch (error) {
        delete req.session.uesrid
        // return res.json({success:false,message:'Somthing went wrong. Try again.'})
        return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Somthing went wrong. Try again.', type: 'danger' })
    }
}

async function newPasswordUpdate(req, res) {
    try {
        const password = req.params.password
        const cpassword = req.params.cpassword
        console.log(`password :${password}  cpassword:${cpassword} and Email is ${req.session.forgetpasswordEmail}`)
        if (password === cpassword) {
            const hashedpassword = await bcrypt.hash(password, 10)
            if (hashedpassword) {
                const updated = await User.findOneAndUpdate({ email: req.session.forgetpasswordEmail }, { $set: { password: hashedpassword } })
                if (updated) {
                    console.log('password updated successfully')
                    return res.json({ success: true, message: 'password updated successfully' })
                } else {
                    console.log('Somthing went wrong while updating the hashed password at newpassword/:pa.....');
                    return res.json({ success: false, message: 'Somthing went wrong while updating the hashed password at newpassword/:pa.....' })
                }
            } else {
                console.log('Somthing went wrong while hashing the password')
                return res.json({ success: false, message: 'Somthing went wrong while hashing the password' })
            }
        } else {
            console.log('passwords are not matching')
            return res.json({ success: false, message: 'passwords are not matching' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' })
    }
}

module.exports = {
    personHome,
    userDetailHome,
    profilePage,
    changeName,
    changePhone,
    changeEmail,
    otpPage,
    verifyOtpPost,
    changePassword,
    forgotPasswordPage,
    forgotPasswordOtpSent,
    forgotOtpPage,
    verifyForgotPost,
    newPasswordUpdate
}

//Functionss//

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

const sendOtpVerificationEmail = async ({ _id, email }, req, res) => {
    console.log('Entered into the function.')
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        //mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Email verification',
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address.</p>
            <p>This code will <b>Expires in one hour</b></p>`
        }
        //hash the otp
        const saltrounds = 10
        req.session.emailAddress = email
        req.session.uesrid = _id
        console.log(`your Email is ${req.session.emailAddress} and User id is ${req.session.uesrid}`)
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
                console.log('unknown error ')
                return res.json({ success: false, message: 'Unknown Error.error' })
            } else {
                console.log('otp successfull')
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
        return res.json({ success: false, message: 'Unknown Error.' })

    }
}