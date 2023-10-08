const express = require('express');
const app = express();
const port = 3000
const bodyParser=require('body-parser')
const morgan=require('morgan')
const path=require('path')
const {dbconnect}=require('./config')


require('dotenv/config')


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

//to load static files
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'public/assets')))



//Middlewares
app.use(bodyParser.json())
app.use(morgan('tiny'))



//routers
const productRouter=require('./routers/products');
const usersRouter=require('./routers/users')
const brandsRouter=require('./routers/brands')
const categoriesRouter=require('./routers/categories')

const api = process.env.API_URL

app.use(`/products`,productRouter)
app.use(`/users`,usersRouter)
app.use('/brands',brandsRouter)
app.use('/categories',categoriesRouter)









dbconnect()

app.listen(port,()=>console.log('server is running on port 3000'));
