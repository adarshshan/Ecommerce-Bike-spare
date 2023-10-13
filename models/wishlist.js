const mongoose=require('mongoose')

const wishlistSchema=new mongoose.Schema({
    isDeleted:{
        type:Boolean,
        default:false
    }
})

const wishlist=mongoose.model('wishlist',wishlistSchema)
module.exports=wishlist;