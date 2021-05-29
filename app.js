const path = require('path')
var bodyParser = require('body-parser')
var bb = require('express-busboy');
const express = require('express')
var methodOverride = require('method-override')
const mongoose = require('mongoose')
var exphbs = require('express-handlebars');
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const moment = require('moment')
require('dotenv').config()

const connectDB = require('./db/mongoose')

connectDB()

//initialize agent and customer

const Initialize = require('./Utils/initialize')
Initialize.InitializeWalkInCustomer()
Initialize.InitializeAdmin()

const mainRouter = require('./routes/main')
const userAuthRouter = require('./routes/user_auth');
const userRouter = require('./routes/users')
const adminRouter = require('./routes/admin')
const menuItemRouter = require('./routes/menu_item')
const menuRouter = require('./routes/menu')
const orderRouter = require('./routes/order')
const customersRoute = require('./routes/customers')
const ordersRouter = require('./routes/orders_agent')
const reportsRouter = require('./routes/reports')
const walkinRouter = require('./routes/order_walkin')
const invoiceRouter = require('./routes/invoice')

const agentAPI = require('./api/users')
const menuAPI = require('./api/menu')
const menuItemAPI = require('./api/menuItem')

const app = express()

//request handler

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

//setting up auth using passport

require('./middleware/passport')(passport)

//setting up handlebars and helpers for view

let DateFormats = {
  short: "DD MMMM - YYYY",
  long: "dddd DD.MM.YYYY HH:mm"
};


app.engine('.hbs', exphbs({
  extname: '.hbs',
  //defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: [path.join(__dirname, 'views/partials')],
  helpers: {
    times: function (n, block) {
      var accum = '';
      for (var i = 0; i < n; ++i)
        accum += block.fn(i);
      return accum;
    },
    ifEquals: function (arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    formatDate: function (datetime, format) {
      if (moment) {
        // can use other formats like 'lll' too
        format = DateFormats[format] || format;
        return moment(datetime).format(format);
      } else {
        return datetime;
      }
    }
  }
}));

app.set('view engine', '.hbs');

app.use(express.static('./public'))

//setting up sessions

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
  }),
  cookie: {
    expires: new Date(Date.now() + 86400000),
  }
}))

// clear cache

app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


//method overriding

app.use(bodyParser.urlencoded({
  extended: true
}))
// bb.extend(app, {urlencoded:true});
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


//use flash for messages

app.use(flash())

//gobal vars for messages

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

//initialise passport and session

app.use(passport.initialize())
app.use(passport.session())


//Auth for API
const api = require('./api/validateApiRequest')
app.get('/api/*', api.Authorization)
app.put('/api/*', api.Authorization)
app.post('/api/*', api.Authorization)
app.delete('/api/*', api.Authorization)

//secure pages with auth

const Auth = require('./middleware/auth')
app.get('/orders', Auth.isAuth);
app.get('/orders/*', Auth.isAuth);
app.get('/admin', Auth.isAuth, Auth.isAgent, Auth.isAdmin);
app.get('/admin/*', Auth.isAuth, Auth.isAgent, Auth.isAdmin);
app.get('/a', Auth.isAuth, Auth.isAgent);
app.get('/a/*', Auth.isAuth, Auth.isAgent);



//registering apis

app.use(agentAPI)
app.use(menuAPI)
app.use(menuItemAPI)

//registering routes

app.use(userAuthRouter)
app.use(userRouter)
app.use(adminRouter)
app.use(menuItemRouter)
app.use(menuRouter)
app.use(orderRouter)
app.use(customersRoute)
app.use(ordersRouter)
app.use(reportsRouter)
app.use(walkinRouter)
app.use(invoiceRouter)
app.use(mainRouter)

app.listen(process.env.PORT)