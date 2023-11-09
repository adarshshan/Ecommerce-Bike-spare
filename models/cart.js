const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product',
                required:true,
            },
            productName:{
                type:String,
                required:true,
            },
            productPrice:{
                type:Number,
                required:true,
            },
            productImage:{
                type:String
            },
            discription:{
                type:String
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    isDeleted:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Date,
        default:Date.now
    },
    deleted_at:{
        type:Date
    }
})

const cart=mongoose.model('cart',cartSchema);
module.exports=cart;