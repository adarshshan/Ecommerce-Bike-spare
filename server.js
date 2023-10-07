const express = require('express');
const app = express();
const port = 3000
const bodyParser=require('body-parser')
const morgan=require('morgan')
const products=require('./mongodb')

//Middlewares
app.use(bodyParser.json())
app.use(morgan('tiny'))

require('dotenv/config')

const api = process.env.API_URL

app.get(`${api}/product`,(req,res)=>{
    const product={
        id:1,
        name:"knife",
        price:288

    }
    res.send(product)
})
app.post(`${api}/product`,(req,res)=>{
    const newproduct=req.body;
    console.log(newproduct+'hai')
    res.send(newproduct)
})
app.listen(port,()=>console.log('server is running on port 3000'));
