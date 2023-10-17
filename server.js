const express = require('express');
const app = express();
const port = 3000
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const { dbconnect } = require('./config')
const cors = require('cors')
const session=require('express-session')
const {v4:uuidv4}=require('uuid')
const nocache=require('nocache')
const multer=require('multer')
const mul=require('./utils/multer')

const oneDay = 1000 * 60 * 60 * 24

app.use(cors())
app.use('*', cors())

app.use(nocache())

require('dotenv/config')

//to set view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//to load static files
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'public/assets')))
app.use(express.static(path.join(__dirname,'utils')))
app.use(express.static(path.join(__dirname,'uploads')));
// app.use(multer({dest:'uploads',Storage:mul.fileStorage,fileFilter:mul.fileFilter}).array('image',10))
app.use(express.static(path.join(__dirname,'controller')))

app.use(express.static(path.join(__dirname,'middlware')))



app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneDay }
}))

//Middlewares
app.use(bodyParser.json())
app.use(morgan('tiny'))

//to delete the session
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message
    
    next()
})



//routers
const productRouter = require('./routers/admin/products');
const usersRouter = require('./routers/admin/users')
const brandsRouter = require('./routers/admin/brands')
const categoriesRouter = require('./routers/admin/categories')
const ordersRouter = require('./routers/admin/orders')
const couponsRouter = require('./routers/admin/coupons')
const cartsRouter = require('./routers/admin/carts')
const wishlistsRouter = require('./routers/admin/wishlists')
const userDetailsRouter = require('./routers/admin/userDetails')
const paymentsRouter = require('./routers/admin/payments')
const adminRouter=require('./routers/admin/admin')

const personsRouter=require('./routers/user/person')

const api = process.env.API_URL

app.use(`/products`, productRouter)
app.use(`/users`, usersRouter)
app.use('/brands', brandsRouter)
app.use('/categories', categoriesRouter)
app.use('/orders', ordersRouter)
app.use('/coupons', couponsRouter)
app.use('/carts', cartsRouter)
app.use('/wishlists', wishlistsRouter)
app.use('/userDetails', userDetailsRouter)
app.use('/payments', paymentsRouter)
app.use('/admin',adminRouter)

app.use('/persons',personsRouter)




dbconnect()

app.listen(port, () => console.log('server is running on port 3000'));
