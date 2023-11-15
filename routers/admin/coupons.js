const express = require('express')
const router = express.Router()
const Coupon = require('../../models/coupon')


router.get('/', async (req, res) => {
    let count = null;
    const pageNum = parseInt(req.query.page) || 1;
    const nextPage = pageNum + 1;
    const prevPage = pageNum - 1;
    const perPage = 6
    let docCount;
    Coupon.find({ isDeleted: false }).countDocuments().then((documents) => {
        docCount = documents
        return Coupon.find({ isDeleted: false }).skip((pageNum - 1) * perPage).limit(perPage).sort({ created_at: -1 })
    }).then((data) => {
        res.render('admin/coupon.ejs', {
            title: 'Coupon Management',
            couponList: data,
            currentPage: pageNum,
            pages: Math.ceil(docCount / perPage),
            nextPage: nextPage <= Math.ceil(docCount / perPage) ? nextPage : null,
            prevPage: prevPage >= 1 ? prevPage : null,
        })
    })
})

router.post('/', (req, res) => {
    // const { amount, expireDate } = req.body
    const amount = req.body.amount
    const expireDate = req.body.expireDate
    const maxusage = req.body.maxusage;
    console.log(`amount is ${amount}  and expiredate4 is ${expireDate}`);
    let isExistDiscount = false
    do {
        let myDiscountCode = coupongenerator()
        console.log(`myDiscountCode is ${myDiscountCode}`);
        let newDiscountCode = new Coupon({
            code: myDiscountCode,
            isPercent: false,
            amount: amount,
            maxusage: maxusage,
            expireDate: expireDate,
            isActive: true
        })
        newDiscountCode.save().then((response) => {
            console.log('Coupon crated successfully...');
            console.log(response);
            return res.json({ success: true, message: 'Coupon created successfully...' });
            // res.redirect('/coupons')
        }).catch((err) => {
            if (err.name === 'MongoError' && err.code === 11000) {
                // Duplicate code detected
                console.log('Duplicate code detected');
                isExistDiscount = true;
            }
        })
    }
    while (isExistDiscount);
})
router.get('/edit-coupon/:id/:amount/:date/:maxusage', async (req, res) => {
    const couponId = req.params.id
    const amount = req.params.amount
    const expireDate = req.params.date
    const maxusage = req.params.maxusage
    const updated = await Coupon.findByIdAndUpdate(couponId, { $set: { amount: amount, expireDate: expireDate, maxusage: maxusage } });
    if (updated && updated !== undefined) {
        console.log('coupon updated');
        return res.json({ success: true, message: 'Coupon updated successfully.' })
    } else {
        console.log('Failed to update  coupon');
        return res.json({ success: false, message: 'Failed to update  coupon' })
    }
})
router.get('/delete-coupon/:couponId', async (req, res) => {
    const couponId = req.params.couponId;
    console.log(`your coupon id is ${couponId}`);
    const deleted = await Coupon.findByIdAndUpdate(couponId, { $set: { isDeleted: true } });
    if (deleted) {
        console.log('coupon deleted...')
        return res.json({ success: true, message: 'Coupon Deleted...' })
    } else {
        console.log('Failed to Delete the coupon...')
        return res.json({ success: false, message: 'Failed to Delete the coupon...' })
    }
})
router.get('/coupon-deactivate/:couponId', async (req, res) => {
    try {
        const couponId = req.params.couponId;
        console.log(`your coupon id is ${couponId}`)
        const deactivated = await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: false } })
        if (deactivated) {
            console.log('Coupon is deactivated...')
            return res.json({ success: true, message: 'Coupon is deactivated...' })
        } else {
            console.log('Coupon Failed to deactivate...')
            return res.json({ success: false, message: 'Coupon Failed to deactivate...' })
        }
    } catch (error) {
        console.log(error)
    }
})
router.get('/coupon-activate/:id', async (req, res) => {
    try {
        const couponId = req.params.id
        console.log(`your coupon id is ${couponId}`)
        const activated = await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: true } })
        if (activated) {
            console.log('Coupon is activated')
            return res.json({ success: true, message: 'Coupon is activated' })
        } else {
            console.log('Failed to activate the coupon')
            return res.json({ success: false, message: 'Failed to activate the coupon' })
        }
    } catch (error) {
        console.log(error)
    }
})

//userSide coupon usage
router.get('/verify-coupon/:total/:code', async (req, res) => {
    const totalAmount = req.params.total
    const couponCode = req.params.code
    console.log(`your coupon code is ${couponCode} and total amount is ${totalAmount}`)
    const coupon = await Coupon.findOne({ code: couponCode })
    if(!coupon || coupon===null) return res.json({success:false,message:'Entered Coupon Code is Wrong'});
    console.log(`your coupon details is ${coupon}`);
    const currentDate = new Date().toISOString().split('T')[0];
    if (!coupon.isDeleted) {
        if (coupon.isActive) {
            if (coupon.expireDate > currentDate) {
                if (coupon.used_count < coupon.maxusage) {
                    const discountAmount = coupon.amount;
                    const actualAmount = totalAmount - discountAmount
                    console.log(`Discount amount is ${discountAmount} and ActualAmount is ${actualAmount}`)
                    req.session.discount = {
                        discount: discountAmount,
                        total: actualAmount,
                        code:couponCode
                    }
                    return res.json({ success: true, message: 'Coupon approved...', discountAmount, actualAmount })
                } else {
                    console.log('No more coupons left')
                    return res.json({ success: false, message: 'No more coupons left' })
                }
            } else {
                console.log('coupon is Expired.')
                return res.json({ success: false, message: 'coupon is Expired.' })
            }
        } else {
            console.log('Coupon is Deactivated by the admin.')
            return res.json({ success: false, message: 'Not available. Coupon is Deactivated by the admin.' })
        }
    } else {
        console.log('Coupon is No longer Available');
        return res.json({ success: false, message: 'Coupon is No longer Available' })
    }

})

module.exports = router;

//additional functions

function coupongenerator() {
    var coupon = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 6; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupon;
}