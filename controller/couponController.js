const Coupon = require('../models/coupon')


async function couponHome(req, res) {
    try {
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
    } catch (error) {
        console.log(error)
    }
}

function addCoupon(req, res) {
    try {
        const minDiscount = req.body.minDiscount
        const maxDiscount = req.body.maxDiscount
        const expireDate = req.body.expireDate
        const maxusage = req.body.maxusage;
        const minPurchase = req.body.minPurchase;
        const maxPurchase = req.body.maxPurchase
        let isExistDiscount = false
        do {
            let myDiscountCode = coupongenerator()
            let newDiscountCode = new Coupon({
                code: myDiscountCode,
                minPurchase: minPurchase,
                maxPurchase: maxPurchase,
                isPercent: false,
                minDiscount: minDiscount,
                maxDiscount: maxDiscount,
                maxusage: maxusage,
                expireDate: expireDate,
                isActive: true
            })
            newDiscountCode.save().then((response) => {
                return res.json({ success: true, message: 'Coupon created successfully...' });
            }).catch((err) => {
                if (err.name === 'MongoError' && err.code === 11000) {
                    // Duplicate code detected
                    console.log('Duplicate code detected');
                    isExistDiscount = true;
                }
            })
        }
        while (isExistDiscount);
    } catch (error) {
        console.log(error)
    }
}

async function editCoupon(req, res) {
    try {
        const couponId = req.params.id
        const minPurchase = req.params.minPurchase
        const minDiscount = req.params.minDiscount
        const maxPurchase = req.params.maxPurchase
        const maxDiscount = req.params.maxDiscount
        const maxusage = req.params.maxusage
        const expireDate = req.params.date
        const updated = await Coupon.findByIdAndUpdate(couponId, { $set: { minDiscount: minDiscount, minPurchase: minPurchase, maxDiscount: maxDiscount, maxPurchase: maxPurchase, expireDate: expireDate, maxusage: maxusage } });
        if (updated && updated !== undefined) {
            return res.json({ success: true, message: 'Coupon updated successfully.' })
        } else {
            return res.json({ success: false, message: 'Failed to update  coupon' })
        }
    } catch (error) {
        console.log(error)
    }
}

async function deleteCoupon(req, res) {
    try {
        const couponId = req.params.couponId;
        const deleted = await Coupon.findByIdAndUpdate(couponId, { $set: { isDeleted: true } });
        if (deleted) {
            return res.json({ success: true, message: 'Coupon Deleted...' })
        } else {
            return res.json({ success: false, message: 'Failed to Delete the coupon...' })
        }
    } catch (error) {
        console.log(error)
    }
}

async function deactivateCoupon(req, res) {
    try {
        const couponId = req.params.couponId;
        const deactivated = await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: false } })
        if (deactivated) {
            return res.json({ success: true, message: 'Coupon is deactivated...' })
        } else {
            return res.json({ success: false, message: 'Coupon Failed to deactivate...' })
        }
    } catch (error) {
        console.log(error)
    }
}

async function activateCoupon(req, res) {
    try {
        const couponId = req.params.id
        const activated = await Coupon.findByIdAndUpdate(couponId, { $set: { isActive: true } })
        if (activated) {
            return res.json({ success: true, message: 'Coupon is activated' })
        } else {
            return res.json({ success: false, message: 'Failed to activate the coupon' })
        }
    } catch (error) {
        console.log(error)
    }
}


//UserSide 

async function verifyCoupon(req, res) {
    try {
        const totalAmount = req.params.total
        const couponCode = req.params.code
        const coupon = await Coupon.findOne({ code: couponCode })
        const currentDate = new Date().toISOString().split('T')[0];
        if (!coupon || coupon === null) return res.json({ success: false, message: 'Entered Coupon Code is Wrong' });
        if (coupon.minPurchase > totalAmount) return res.json({ success: false, message: `Purchase must not be less than ${coupon.minPurchase}rs for eligible for this coupon.` })
        if (coupon.isDeleted) return res.json({ success: false, message: 'Coupon is No longer Available' })
        if (!coupon.isActive) return res.json({ success: false, message: 'Not available. Coupon is Deactivated by the admin.' })
        if (coupon.expireDate < currentDate) return res.json({ success: false, message: 'coupon is Expired.' })
        if (coupon.used_count > coupon.maxusage) return res.json({ success: false, message: 'No more coupons left' })
        //If there is no error
        if (coupon.maxPurchase < totalAmount) {
            console.log('Congratulations  you are Eligible for high discount!')
            percentCoupon = coupon.maxDiscount
            const discountAmount = totalAmount * percentCoupon / 100;
            const actualAmount = totalAmount - discountAmount

            req.session.discount = {
                discount: discountAmount,
                total: actualAmount,
                code: couponCode,
                couponPercent: coupon.amount
            }
            return res.json({ success: true, message: 'Coupon approved...with high discound', discountAmount, actualAmount, percentCoupon })
        }
        percentCoupon = coupon.minDiscount
        const discountAmount = totalAmount * percentCoupon / 100;
        const actualAmount = totalAmount - discountAmount

        req.session.discount = {
            discount: discountAmount,
            total: actualAmount,
            code: couponCode,
            couponPercent: coupon.amount
        }
        return res.json({ success: true, message: 'Coupon approved...', discountAmount, actualAmount, percentCoupon })
    } catch (error) {
        console.log(error)
    }
}
function cancelCoupon(req,res){
    try {
        delete req.session.discount;
        console.log('coupon cancelled.')
        res.json({success:true,message:'coupon cancelled'})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:'Trouble while cancelling the coupon.'})
    }
}

module.exports = {
    couponHome,
    addCoupon,
    editCoupon,
    deleteCoupon,
    deactivateCoupon,
    activateCoupon,
    verifyCoupon,
    cancelCoupon
}

//additional functions

function coupongenerator() {
    var coupon = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 6; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupon;
}