const Products = require('../models/product')
const User = require('../models/user')
const Address = require('../models/userDetail')
const Brand = require('../models/brand')
const categorie = require('../models/categorie')
const Order = require('../models/order')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const userOtpVerification = require('../models/userOtpVerification')
const notifier = require('node-notifier');
const path = require('path');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const Razorpay = require('razorpay')
const Promise = require('promise')
var instance = new Razorpay({ key_id: 'rzp_test_kxpY9d3K4xgnJt', key_secret: 'NH5mIiVcgS7yf9zr0iwQisAQ' })
const Banner = require('../models/banner')
const helpers = require('../utils/helpers')
const localStorage = require('localStorage')


async function personHome(req, res) {
    try {
        if (req.session.uesrid) {
            delete req.session.uesrid
        }
        const userId = req.session.currentUserId;
        let productList = await Products.find({ isDeleted: false }).sort({ crated_at: -1 }).populate("categorieId", { _id: 0, name: 1 })
        let banners = await Banner.find({ $and: [{ isDeleted: false }, { isActive: true }] });
        // console.log(productList)
        let categoryNames = [...new Set(
            productList
                .filter(product => product.categorieId && product.categorieId.name)
                .map(product => product.categorieId.name)
        )];


        const productsPerPage = 12
        const page = parseInt(req.query.page) || 1;
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productList.slice(start, end)
        if (!productList) {
            res.status(500).json({ success: false })
        } else {
            if (userId && userId !== null && userId !== undefined) {
                const user = await User.findById(userId)
                if (user) var wishlist = user.wishlist
            }
            res.render('user/home_page', {
                title: 'home_page',
                products: paginatedProducts,
                currenPage: page,
                totaPages: Math.ceil(productList.length / productsPerPage),
                wishlist,
                categoryNames,
                banners
            })
        }
    } catch (error) {
        console.log("An Error occured at rendering the user home page..." + error)
        res.redirect('/error-page');
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
        console.log(error)
        console.log('An Error occured when Rendering the product Details...')
        res.redirect('/error-page');
    }
}

async function categoryFilter(req, res) {
    try {
        const categorie = req.params.categoryname;
        var categoryNames = await categoryName();
        const products = await Products.find({ isDeleted: false }).populate('categorieId', { _id: 0, name: 1 })
        console.log(`products is ${products[2].categorieId.name}`);
        let filterResult = [];
        console.log('the length is ', products.length)
        for (let i = 0; i < products.length; i++) {
            if (products[i].categorieId && products[i].categorieId.name === categorie) {
                filterResult.push(products[i]);
            }
        }
        console.log('result is herre boss')
        console.log(filterResult);
        res.render('user/categorieproduct.ejs', { title: 'view-categoryProducts.', filterResult, categoryNames, categorie })
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function profilePage(req, res) {
    try {
        const userId = req.session.currentUserId
        if (userId) {
            const user = await User.findById(userId)
            res.render('user/profile.ejs', { title: 'Profile', user })
        } else {
            console.log('User did not logged in.')
        }
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function changeName(req, res) {
    try {
        const name = req.params.name
        console.log(`name is ${name}`)
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        console.log(`name is ${name}`)
        if (!name) return res.json({ success: false, message: 'Input field must not be blank!' });
        if (specialChars.test(name)) return res.json({ success: false, message: 'Special charactors are not allowed!' })
        if (name.length < 9) return res.json({ success: false, message: 'Name shold be atlest 8 charactors!' })
        if (!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)) return res.json({ success: false, message: 'Enter Full name!' });


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
        res.redirect('/error-page');
        // return res.json({ success: false, message: 'name updation failed false' })
    }
}

async function changePhone(req, res) {
    try {
        const ph = req.params.phone
        console.log('your new phone number is ' + ph)
        if (ph[0] == 0) return res.json({ success: false, message: 'Phone number is not valid' });
        if (ph.length !== 10) return res.json({ success: false, message: 'Mobile number should be 10 numbers' });
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
        // return res.json({ success: false, message: 'Phone number updation Failed..(false)' })
        res.redirect('/error-page');
    }
}

async function changeEmail(req, res) {
    try {
        const email = req.params.email
        req.session.newEmail = email
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isEmail = await User.findOne({ email: email })
        if (!pattern.test(email)) return res.json({ success: false, message: 'Email is invalid!' })
        if (isEmail) return res.json({ success: false, message: 'You provided Email is already been using!' })
        const userId = req.session.currentUserId
        const currentUser = await User.findById(userId)
        const id = currentUser._id
        const user = {
            _id: userId,
            email: email

        }
        await sendOtpVerificationEmail(user, req, res).then((result) => {
            try {
                console.log('otp has been sent to your Email')
                return res.json({ success: true, message: 'Otp has been sent to your Email address.' })
            } catch (error) {
                console.log(error)
            }

        })
    } catch (error) {
        console.log(error)
        // return res.json({ success: false, message: 'Unknown Error' })
        res.redirect('/error-page');
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
        // return res.render('user/otppage_1', { title: 'OTP Login page.', msg: 'Somthing went wrong. Try again.', type: 'danger' })
        res.redirect('/error-page');
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
        // return res.json({ success: false, message: 'Unknown Error' })
        res.redirect('/error-page');
    }
}

async function addressBook(req, res) {
    try {
        const addressBook = await Address.find({ userId: req.session.currentUserId })
        if (addressBook && addressBook !== null && addressBook !== undefined) {
            console.log(`data is here`);
            return res.json({ success: true, message: 'success part', addressBook });
        } else {
            console.log('failed to find data...')
            return res.json({ success: false, message: 'Data not found', addressBook: '' });
        }
    } catch (error) {
        console.log('Error occured at catch block...')
        console.log(error)
        res.redirect('/error-page');
    }
}

//////Forgot password//////
function forgotpageResponse(req, res) {
    try {
        return res.json({ success: true, message: 'success part!' });
    } catch (error) {
        console.log(error)
    }
}
function forgotPasswordPage(req, res) {
    try {
        res.render('user/forgotpage.ejs', { title: 'forgot Password' })
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function forgotPasswordOtpSent(req, res) {
    try {
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
            await helpers.sendOtpVerificationEmail(user, req, res).then((result) => {
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
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function forgotOtpPage(req, res) {
    try {
        res.render('user/otppage_forgot.ejs', { title: 'forgot' })
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function verifyForgotPost(req, res) {
    try {
        const { otp } = req.body
        let userId = req.session.uesrid
        console.log(`userId: ${userId} and otp: ${otp}`);
        const userOtpVerificationRecords = await userOtpVerification.find({ userId })
        console.log(`The details are `);
        console.log(userOtpVerificationRecords);
        if (!userId || !otp) return res.json({ success: false, message: 'Empty OTP details are not allowed' });
        if (userOtpVerificationRecords.length <= 0) return res.json({ success: false, message: 'Account records doesn`t exist or has been verified already. Please sign up or log in' });
        const { expired_at } = userOtpVerificationRecords[0]
        const hashedOtp = userOtpVerificationRecords[0].otp
        if (expired_at < Date.now()) {
            await userOtpVerification.deleteMany({ userId })
            return res.json({ success: false, message: 'Code has expired. please request again.' })
        }
        const validOtp = await bcrypt.compare(otp, hashedOtp)
        console.log(`validate otp is ${validOtp}`);
        if (!validOtp) return res.json({ success: false, message: 'Invalid code passed. check your Inbox.' });

        await userOtpVerification.deleteMany({ userId })
        notifier.notify({
            title: 'Notifications',
            message: 'Email Verified successfully ',
            icon: path.join(__dirname, 'public/assets/sparelogo.png'),
            sound: true,
            wait: true
        })
        return res.json({ success: true, message: 'Email verified successfully.' })




    } catch (error) {
        delete req.session.uesrid
        return res.json({ success: false, message: 'Error occured!' })
    }
}

function newpasswordPage(req, res) {
    try {
        res.render('user/newpassword.ejs', { title: 'newpassword' });
    } catch (error) {
        console.log(error)
    }
}

async function newPasswordUpdate(req, res) {
    try {
        const password = req.params.password
        const cpassword = req.params.cpassword
        console.log(`password :${password}  cpassword:${cpassword} and Email is ${req.session.forgetpasswordEmail}`)
        if (password !== cpassword) return res.json({ success: false, message: 'passwords are not matching' });
        const hashedpassword = await bcrypt.hash(password, 10)
        if (!hashedpassword) return res.json({ success: false, message: 'Somthing went wrong while hashing the password' });
        const updated = await User.findOneAndUpdate({ email: req.session.forgetpasswordEmail }, { $set: { password: hashedpassword } })
        if (updated) {
            console.log('password updated successfully')
            return res.json({ success: true, message: 'password updated successfully' })
        } else {
            console.log('Somthing went wrong while updating the hashed password at newpassword/:pa.....');
            return res.json({ success: false, message: 'Somthing went wrong while updating the hashed password at newpassword/:pa.....' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: 'Unknown Error' })
        // res.redirect('/error-page');
    }
}

///////////wishlist-Controller////////

async function wishlistHome(req, res) {
    try {
        const userId = req.session.currentUserId
        const users = await User.findById(userId).populate('wishlist.productId')
        console.log('users')
        const wishlist = users.wishlist.sort((a, b) => b.date - a.date)
        console.log(wishlist)
        return res.render('user/wishlist.ejs', { title: 'wishlist', wishlist })
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function addToWishlist(req, res) {
    try {
        const productId = req.params.id;
        const userId = req.session.currentUserId;
        if (!userId) return res.json({ success: false, message: 'user not logined...' });
        // Check if the product already exists in the user's wishlist
        const user = await User.findOneAndUpdate(
            { _id: userId, 'wishlist.productId': { $ne: productId } },
            { $push: { wishlist: { $each: [{ productId: productId }], $position: 0 } } },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: 'The product is already in the wishlist.' });
        }

        console.log('Product added to wishlist');
        return res.json({ success: true, message: 'Product added to wishlist.' });
    } catch (error) {
        console.log(error);
        // return res.status(500).json({ success: false, message: 'An error occurred while adding the product to wishlist.' });
        res.redirect('/error-page');
    }
}

async function removeWishlist(req, res) {
    try {
        const Id = req.params.id
        const userId = req.session.currentUserId;
        const removed = await User.findByIdAndUpdate(userId, { $pull: { wishlist: { _id: Id } } })
        if (removed && removed !== null && removed !== undefined) {
            console.log('product removed from the wishlist.')
            return res.json({ success: true, message: 'product removed from the wishlist.' });
        } else {
            console.log('Somthing went wrong...');
            return res.json({ success: false, message: 'Failed to remove the product from the wishlist.' });
        }
    } catch (error) {
        console.log(error)
        // return res.json({ success: false, message: 'Unknown Error' });
        res.redirect('/error-page');
    }
}

//////////Wallet controller/////////
async function walletHome(req, res) {
    try {
        const userId = req.session.currentUserId
        const id = new ObjectId(userId)
        const userwallet = await User.findById(userId, { _id: 0, wallet: 1 })
        const balance = userwallet.wallet.balance
        console.log(`balance is ${balance}`);
        const wallet = await User.aggregate([
            { $match: { _id: id } },
            { $unwind: "$wallet.transactions" },
            { $sort: { "wallet.transactions.time": -1 } },
            {
                $group: {
                    _id: "$_id",
                    wallet: { $push: "$wallet.transactions" }
                }
            },
            { $project: { _id: 0, wallet: 1 } }
        ])
        console.log(`wallet is ${wallet}`)
        res.render('user/wallet.ejs', {
            title: 'wallet',
            wallet: wallet[0] ? wallet[0].wallet : [],
            balance
        });
    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

async function addWalletFund(req, res) {
    try {
        const amount = req.params.amount
        console.log('Entered amount is ', amount)
        const { v4: uuidv4 } = require('uuid');
        const uniqueId = uuidv4().replace(/-/g, '');
        generateRazorpay(amount, uniqueId, res).then((wallet) => {
            console.log(`the wallet is ${wallet}`);
            console.log(wallet);
            return res.json({ online: true, message: 'Wallet Recharge', wallet });
        }).catch((err) => {
            console.log(err)
            return res.json({ online: false, message: 'Somthing went wrong at a catch ` ' })
        })

    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}
function generateRazorpay(total, uniqueId, res) {
    return new Promise((resolve, reject) => {
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: uniqueId,
            payment_capture: 1,
        };
        instance.orders.create(options, function (err, wallet) {
            if (err) {
                console.log('error is here.')
                console.log(err)
                if (err.error) return res.json({ online: false, message: err.error.description });
                return res.json({ online: false, message: 'make sure your internet is connected...' });
            } else {
                resolve(wallet);
            }
        });
    })
}

async function refundWallet(req, res) {
    try {
        const orderId = req.params.orderId
        console.log(`your order id is ${orderId}`);
        const data = await Order.findOne({ 'orders._id': orderId }, { orders: { $elemMatch: { _id: orderId } } })
        const order = await Order.findOne({ 'orders._id': orderId })
        const userId = order.userId;
        const walletfund = data.orders[0].walletAmount;
        const total = data.orders[0].totalAmount;
        const RefundableAmount = walletfund + total;
        const changed = await IncreaseWalletBalance(userId, RefundableAmount);
        if (!changed) return res.json({ success: false, message: 'failed add the cancellation amount.' });
        await Order.findOneAndUpdate({ 'orders._id': orderId }, { $set: { 'orders.$.refund': false } })
        return res.json({ success: true, message: 'Cancellation amount added to the wallet' })
    } catch (error) {
        console.log(error)
        // return res.json({ success: false, message: 'Unknown Error occured.!' })
        res.redirect('/error-page');
    }
}

async function veryfyPay(req, res) {
    try {
        const { payment, wallet } = req.body
        console.log('from veryftypayment api')
        console.log(req.body);
        const userId = req.session.currentUserId
        helpers.veryfyPaymentwallt(payment, wallet).then(() => {
            console.log('payment success in veryfypayment')
            helpers.addWalletAmount(userId, wallet).then((updatedUser) => {
                return res.json({ status: true, message: 'payment verifyed successfully and wallet amount updated.' })
            }).catch((err) => console.log(err))

        }).catch((err) => {
            console.log(err)
            res.json({ status: false, message: 'Somthing went wrong at catch block.' })
        })
    } catch (error) {
        console.log('Error occured at veryfyPay')
        console.log(error)
        res.redirect('/error-page');
    }
}

async function shareLink(req, res) {
    try {
        const Email = req.params.email
        console.log(Email);
        const sendUri = await helpers.sendUriToEmail(Email, req);
        if (sendUri) {
            console.log('email send success fully.')
            return res.json({ success: true, message: 'email send success fully.' })
        } else {
            return res.json({ success: false, message: 'failed to send the email.' })
        }

    } catch (error) {
        console.log(error)
        res.redirect('/error-page');
    }
}

function ErrorPage(req, res) {
    res.render('user/404.ejs')
}
async function walletHistoryPagination(req, res) {
    try {
        const userId = req.session.currentUserId
        const id = new ObjectId(userId)
        const wallet = await helpers.walletTransactions(id)
        let transactions = wallet[0].wallet.map(data => data);
        if (localStorage.getItem('pageWalletHistory')) {
            localStorage.setItem('pageWalletHistory', parseInt(localStorage.getItem('pageWalletHistory')) + 1)
        } else {
            localStorage.setItem('pageWalletHistory', 1);
        }
        const page = parseInt(localStorage.getItem('pageWalletHistory'));
        let totalpages = Math.ceil(transactions.length / 8)
        if (page === totalpages) {
            localStorage.removeItem('pageWalletHistory');
        }
        return res.json({ success: true, message: 'Transactions found', transactions, page })
    } catch (error) {
        console.log(error)
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
    newPasswordUpdate,
    wishlistHome,
    addToWishlist,
    removeWishlist,
    walletHome,
    addWalletFund,
    addressBook,
    refundWallet,
    categoryFilter,
    veryfyPay,
    shareLink,
    ErrorPage,
    walletHistoryPagination,
    forgotpageResponse,
    newpasswordPage
}

//Functionss//

async function categoryName() {
    try {
        let productList = await Products.find({ isDeleted: false }).sort({ crated_at: -1 }).populate("categorieId", { _id: 0, name: 1 })

        // console.log(productList)
        let categoryNames = [...new Set(
            productList
                .filter(product => product.categorieId && product.categorieId.name) // Filter out null or undefined categorieId
                .map(product => product.categorieId.name)
        )];
        return categoryNames;
    } catch (error) {
        console.log(error)
    }
}

async function IncreaseWalletBalance(userId, amount) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': amount },
                $push: {
                    'wallet.transactions': {
                        type: 'debited',
                        amount: amount,
                        description: 'Order Cancelled by You.',
                        time: Date.now()
                    }
                }
            },
            { new: true, upsert: true }
        )
        if (updatedUser) {
            console.log('Cancellation amount added to the wallet');
            return true;
        } else {
            console.log('failed add the cancellation amount.');
            return false;
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}



