const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/project_1')
.then(()=>{
    console.log('Mongodb is connected.')
})
.catch((err)=>{
    console.log("mongodb is Failed to connect.")
})

const prouctSchema = new mongoose.Schema({
    name:String,
    image:String,
    countInStock:Number
})

const product=new mongoose.model('product',prouctSchema)
module.exports = product