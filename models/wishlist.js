const mongoose=require('mongoose')

const wishlistSchema=new mongoose.Schema({

})

const wishlist=mongoose.model('wishlist',wishlistSchema)
module.exports=wishlist;