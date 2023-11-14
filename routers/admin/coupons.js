const express = require('express')
const router = express.Router()
const Coupon = require('../../models/coupon')


router.get('/', async (req, res) => {
    const couponList = await Coupon.find()

    res.render('admin/coupon.ejs',{title:'Coupon Management',couponList})
})

router.post('/', (req, res) => {
const {amount,expireDate}=req.body
    let isExistDiscount = false
    do {
        let myDiscountCode = coupongenerator()
        console.log(`myDiscountCode is ${myDiscountCode}`);
        let newDiscountCode = new Coupon({
            code: myDiscountCode,
            isPercent: false,
            amount: amount,
            expireDate: expireDate,
            isActive: true
        })
        newDiscountCode.save().then((response)=>{
            console.log('Coupon crated successfully...');
            console.log(response);
            res.redirect('/coupons')
        }).catch((err)=>{
            if (err.name === 'MongoError' && err.code === 11000) {
                // Duplicate code detected
                console.log('Duplicate code detected');
                isExistDiscount = true;
            }
        })
    }
    while (isExistDiscount);
})
router.get('/edit-coupon/:id/:amount/:date',async (req,res)=>{
    const couponId=req.params.id
    const amount=req.params.amount
    const expireDate=req.params.date
    const updated=await Coupon.findByIdAndUpdate(couponId,{$set:{amount:amount,expireDate:expireDate}});
    if(updated && updated!==undefined){
        console.log('coupon updated');
        return res.json({success:true,message:'Coupon updated successfully.'})
    }else{
        console.log('Failed to update  coupon');
        return res.json({success:false,message:'Failed to update  coupon'})
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