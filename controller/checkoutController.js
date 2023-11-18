const Cart = require('../models/cart')
const addressModel = require('../models/userDetail')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;



async function checkoutPage(req, res) {
    const userId = req.session.currentUserId
    const user = new ObjectId(userId)
    if (userId) {
        const address = await addressModel.findOne({ userId: userId })
        const cart = await Cart.findOne({ userId: userId })
        if (cart && cart !== null && cart !== undefined && cart.products.length !== 0) {

            const { totalAmount, totalProducts, totalDiscount } = await calculateTotalAmount({ userId: user })
            var addressDetails
            if (address && address !== null) {
                addressDetails = address.address;
            } else {
                console.log('data not found')
            }
            res.render('user/checkout.ejs', { title: 'checkout', addressDetails, totalAmount, totalProducts, totalDiscount })
        } else {
            console.log('Cart is empty')
            return res.redirect('/carts')
        }


    } else {
        console.log('not userid')
        return res.redirect('/users/login');
    }

}

async function addAddress(req, res) {
    try {
        const userId = req.session.currentUserId
        const data = req.body
        if (userId) {
            const exist = await addressModel.findOne({ userId: userId })
            if (exist && exist !== null) {
                await addressModel.findOneAndUpdate({ userId: userId }, { $push: { address: [data] } })
            } else {
                await addressModel.insertMany({
                    userId: userId,
                    address: [data]
                })
            }
            res.json({ message: 'address added successfully' })
        } else {
            console.log('UserId is not available...')
            return res.redirect('/users/login')
        }
    } catch (error) {
        console.log(`Error at post address${error}`)
    }
}

async function addressGet(req, res) {
    try {
        const userId = req.session.currentUserId
        const addressList = await addressModel.findOne({ userId: userId })
        if (addressList && addressList !== null) {
            res.json({ addressList: addressList })
        } else {
            console.log("address with provided userId does not exist...")
        }
    } catch (error) {
        console.log(`Error at address get...${error}`)
    }
}

async function updateAddress(req, res) {
    try {
        const id = req.params.id
        const data = req.body
        console.log(data)
        console.log(`id is ${id}  and the data is ${data}`)
        // const update=await addressModel.findOneAndUpdate({'address._id':id},{$set:{address:[data]}})
        const update = await addressModel.findOneAndUpdate({ 'address._id': id }, {
            $set: {
                'address.$.name': data.name,
                'address.$.phone': data.phone,
                'address.$.fullAddress': data.fullAddress,
                'address.$.pinCode': data.pinCode,
                'address.$.district': data.district,
                'address.$.landmark': data.landmark,
                'address.$.alternativePhone': data.alternativePhone,
            }
        })
        // const updated=await addressModel.findByIdAndUpdate(id,{$set:{address:[data]}})
        if (update) {
            console.log(`successfully updated...`);
            return res.json({ message: 'address successfully updated' })
        } else {
            console.log(`updation failed..`)
            return res.json({ message: 'address updation failed...' })
        }

    } catch (error) {
        console.log('Error while updating the address At /users/updateAddress')
    }
}

async function deleteAddress(req, res) {
    const idd = req.params.id
    const id = new ObjectId(idd)
    console.log('it is your address id ' + id)
    const userId = req.session.currentUserId
    const deleted = await addressModel.findOneAndUpdate({ userId: userId }, { $pull: { address: { _id: id } } })
    const addressList = await addressModel.findOne({ userId: userId })
    if (deleted) {
        console.log('Address removed...')
        res.json({ addressList: addressList })
    }

}

module.exports = {
    checkoutPage,
    addAddress,
    addressGet,
    updateAddress,
    deleteAddress
}

const calculateTotalAmount = async (matchCriteria) => {
    console.log('Matching criteria:', matchCriteria);

    const result = await Cart.aggregate([
        {
            $match: matchCriteria
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $group: {
                _id: null,
                totalAmount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    {
                                        $subtract: [
                                            "$product.price",
                                            { $multiply: ["$product.price", { $divide: ["$product.discount", 100] }] }
                                        ]
                                    },
                                    "$products.quantity"
                                ]
                            },
                            else: { $multiply: ["$product.price", "$products.quantity"] }
                        }
                    }
                },
                totalDiscount: {
                    $sum: {
                        $cond: {
                            if: { $ne: ["$product.discount", 0] },
                            then: {
                                $multiply: [
                                    "$product.price",
                                    { $divide: ["$product.discount", 100] },
                                    "$products.quantity"
                                ]
                            },
                            else: 0
                        }
                    }
                },
                totalProducts: { $sum: 1 }
            }
        }
    ]);


    console.log('Aggregation result:', result);




    if (result.length > 0) {
        console.log('Total Amount:', result[0].totalAmount);
        console.log(`totalProducts ${result[0].totalProducts}`)
        console.log(`totalDiscount ${result[0].totalDiscount}`)
        let totalAmount = result[0].totalAmount
        let totalProducts = result[0].totalProducts
        let totalDiscount = result[0].totalDiscount
        return { totalAmount, totalProducts, totalDiscount };
    } else {
        console.log('No results found.');
        return 0; // Return 0 if no results
    }
};