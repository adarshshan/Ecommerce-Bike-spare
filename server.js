const express = require('express');
const app = express();
const port = 3000
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const { dbconnect } = require('./config')
const cors = require('cors')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const nocache = require('nocache')
const imageUpload = require('./utils/multer')


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

app.use(express.json());
//to load static files
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'public/assets')))
app.use(express.static(path.join(__dirname, 'utils')))
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'controller')))
app.use(express.static(path.join(__dirname, 'middlware')))

app.use(imageUpload)


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
app.use((req, res, next) => {
  res.locals.email = req.session.name
  res.locals.NoUser = req.session.userlogin
  next()
})


//routers
const productRouter = require('./routers/admin/products');
const usersRouter = require('./routers/admin/users')
const brandsRouter = require('./routers/admin/brands')
const categoriesRouter = require('./routers/admin/categories')
const ordersRouter = require('./routers/admin/orders')
const couponsRouter = require('./routers/admin/coupons')
const userDetailsRouter = require('./routers/admin/userDetails')
const adminRouter = require('./routers/admin/admin')
const bannerRouter = require('./routers/admin/banner')
const dashboardRouter = require('./routers/admin/dashboard')

const personsRouter = require('./routers/user/person')
const cartsRouter = require('./routers/user/carts')

const api = process.env.API_URL

app.use(`/products`, productRouter)
app.use(`/users`, usersRouter)
app.use('/brands', brandsRouter)
app.use('/categories', categoriesRouter)
app.use('/orders', ordersRouter)
app.use('/coupons', couponsRouter)
app.use('/userDetails', userDetailsRouter)
app.use('/admin', adminRouter)
app.use('/banners', bannerRouter)
app.use('/dashboard', dashboardRouter)

app.use('/', personsRouter)
app.use('/carts', cartsRouter)


dbconnect()

// Wildcard Route Handler 
app.use('*', (req, res, next) => {
  const err = new Error(`Cannot Find ${req.originalUrl} on server`);
  err.status = 'Fail';
  err.statusCode = 404;
  next(err);
});

// Error Handling Middleware 
app.use((err, req, res, next) => {
  if (err.statusCode == 404) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    // Log specific error details instead of the entire object
    console.error(`Error 404: ${err.message}`);
    return res.render('user/404.ejs');
  }
  // Handle other types of errors or redirect to a general error page
  console.error(`Internal Server Error: ${err.message}`);
  return res.redirect('/err-internal');
});

app.listen(port, () => console.log('server is running on port 3000'));
