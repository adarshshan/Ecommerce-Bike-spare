const mongoose=require('mongoose')

module.exports.dbconnect=()=>{
    mongoose.connect(process.env.MONGO) 
.then(()=>{ 
    console.log('Mongodb is connected...')
})
.catch(()=>{
    console.log("Failed to connect with mongodb...")
})
}