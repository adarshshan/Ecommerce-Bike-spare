const express = require('express')
const router = express.Router()
const controller = require('../../controller/personController')
const userAuth = require('../../middlware/userAuth')
const User = require('../../models/user')
const nodemailer = require('nodemailer')
const Order = require('../../models/order');
const Products = require('../../models/product')


router.get('/', controller.personHome)
router.get('/productDetails/:id', controller.userDetailHome)
router.get('/view-categorie-products/:categoryname', controller.categoryFilter)


//--------Profile-----//
router.get('/profile', userAuth, controller.profilePage)
router.get('/changeName/:name', userAuth, controller.changeName)
router.get('/changePhone/:phone', userAuth, controller.changePhone)
router.get('/changeEmail/:email', userAuth, controller.changeEmail)
router.get('/verifyOtp', userAuth, controller.otpPage)
router.post('/verifyOtp', userAuth, controller.verifyOtpPost)
router.get('/changePassword/:old/:new', userAuth, controller.changePassword)
router.get('/address', userAuth, controller.addressBook)


//-----forgot password------//
router.get('/forgotPassword', controller.forgotPasswordPage)
router.get('/forgotPassword/:email', controller.forgotPasswordOtpSent)
router.get('/verifyForgot', controller.forgotOtpPage)
router.post('/verifyForgot', controller.verifyForgotPost)
router.get('/newpassword/:password/:cpassword', controller.newPasswordUpdate)

//wishlist
router.get('/wishlist', userAuth, controller.wishlistHome)
router.get('/add-wishlist/:id', userAuth, controller.addToWishlist);
router.get('/remove-wishlist/:id', userAuth, controller.removeWishlist)


//wallet
router.get('/wallet', userAuth, controller.walletHome)
router.get('/add-walletfund/:amount', userAuth, controller.addWalletFund)
router.get('/wallet-refund/:orderId', controller.refundWallet);
router.post('/veryfy-payment', async (req, res) => {
    const { payment, wallet } = req.body
    const userId = req.session.currentUserId
    veryfyPayment(payment).then(() => {
        console.log('payment success in veryfypayment')
        addWalletAmount(userId, wallet).then((updatedUser) => {
            return res.json({ status: true, message: 'payment verifyed successfully and wallet amount updated.' })
        }).catch((err) => console.log(err))

    }).catch((err) => {
        console.log(err)
        res.json({ status: false, message: 'Somthing went wrong at catch block.' })
    })
})


//refferal offer

router.get('/share-link/:email', async (req, res) => {
    try {
        const Email = req.params.email
        console.log(Email);
        const sendUri = await sendUriToEmail(Email,req);
        if(sendUri){
            console.log('email send success fully.')
            return res.json({success:true,message:'email send success fully.'})
        }else{
            return res.json({success:false,message:'failed to send the email.'})
        }


    } catch (error) {
        console.log(error)
    }
})

module.exports = router


//additional functions
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})
async function sendUriToEmail(email,req) {
    const userId=req.session.currentUserId
    const user=await User.findById(userId)
    const refferalCode=user.refferalCode
    console.log(`your reffeslkfjsd code is ${refferalCode}`)
    mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Hello Costomer.',
        html: `<p>This is your refferal link. <b>http://localhost:3000/users/signup/?refferalCode=${refferalCode}</b> You will get 50rs wallet balance, by signup using this refferal link.</p>
        <p><b>Hurry up join with us</b></p>`
    }
    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Success parttt')
        }
    })
}


function veryfyPayment(payment) {
    return new Promise((resolve, reject) => {
        const Crypto = require('crypto')
        let hmac = Crypto.createHmac('sha256', 'NH5mIiVcgS7yf9zr0iwQisAQ')

        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == payment.razorpay_signature) {
            resolve()
            console.log('resolved')
        } else {
            reject()
            console.log('rejected')

        }
    })
}
function addWalletAmount(userId, wallet) {
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': wallet.amount },
                $push: {
                    'wallet.transactions': {
                        type: 'debited',
                        amount: wallet.amount,
                        description: 'fund add by the user',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        ).then((updatedUser) => {
            console.log(`updateddddd...`)
            console.log(updatedUser)
            resolve(updatedUser)
            console.log('resolved')
        })
            .catch((err) => {
                console.log(err)
                console.log('somthing trouble while update the wallet balance.')
                reject()
                console.log('rejected..')
            })
    })
}


