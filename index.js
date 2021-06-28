// adding an express server
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
//const mongoDBSession = require('connect-mongodb-session')(session);
//const mongoose = require('mongoose');
// MongoClient has a connect method that allows us to connect to MongoDB using Node.j
const mongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const port = process.env.PORT;
const app = express();
const bcrypt = require('bcrypt');
//path to display images from the public folder
const path = require("path");
const multer = require('multer');
require('dotenv').config();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
//const csrfMiddleware = csrf({ cookie: true });
//const csrfProtection = csrf();
const LocalStrategy = require('passport-local').Strategy;
//const serviceAccount = require("./serviceAccountKey.json");
//const cart = require(cart);
//to store password 
passport.serializeUser(function(user, done){
  done(null, user.id);
});
//and if it is error usethis one
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});
passport.use('local.register', new LocalStrategy({
    useernameField: 'username',
    userEmailFild: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
}));

//const serviceAccount = require("./serviceAccountKey.json");
//const expressValidator = require('express-validator');


//import the module
const mongoose = require("mongoose");
const { ResultWithContext } = require('express-validator/src/chain');

console.log(process.env.MONGODB_URI);
/**
 * set up MongoDB url to connect with
 * This method accepts the MongoDB server address (url) and a callback function
 */
//const mongoDB = "mongodb://localhost:27017"
var mongoDB = process.env.MONGODB_URI;

//console.log(mongoDB);
const urlEncodedParser = bodyParser.urlencoded({extended:false});
mongoClient.connect(mongoDB,function(err,client){
  console.log('connected with DB');
});


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//app.use(logger('dev'));
app.use(bodyParser.json());

//app.use(cookieParser());
//app.use(csrfMiddleware);
//app.use(session({secret: 'mysupersecret', resave: false, saveUninitialized: false}));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(validator());
app.use(cookieParser());
//app.use(csrfMiddleware);
//app.use(session({secret: 'mysupersecret', resave: false, saveUninitialized: false}));
//app.use(csrfProtection);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// app.all("*",(req,res,next) => {
//   res.cookie("XSRF-TOKEN",req.csrfToken());
//   next();
// });

//app.engine("html",require('pug').renderFile);
//app.engine("html",require('pug').renderFile);
/**
 * setting the pug engine to load the page
 * to use the css, js, and img file from the public folder to make it dynamic
 * to get the home page and display itby calling the function requeste and response
 */
app.set('view engine', 'pug');
/**
 * this is a local server listen in port number 3000
 * and it can be added other port number too for now heroku listens 5000
 */
app.listen(port,()=>{
  console.log(`Example app listening on port ${port}`)
});

//set the static public folder and configure express to use it such as css, js, img
app.use(express.static(path.join(__dirname,'public')));

//setting global errors
app.locals.errors = null;

//Express session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//express flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
})


/**
 *this is the root page route the index page 
 */
app.get('/', function(req,res){
    //connection to the database
  mongoClient.connect(mongoDB,function(err,client){
    console.log(client);
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.find({}).toArray((error, documents)=>{
      console.log(documents);
      //this is to run the data after to close the database
      client.close();
      res.render('index',{documents:documents});
    });
  });
});

/**
 * adding a route for about and render it
 * to display the page
 */
app.get('/about/', function(req,res){
    res.render('about', {});
});

/**route for menu page
 *  and render the page and connect with the database
 */
app.get('/menu', function(req,res){
  mongoClient.connect(mongoDB, function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.find().toArray(function(error,documents){
      client.close();
      res.render('menu', {menus:documents});
    });
  });
});


/** a route for menu page and and filter menus
 * and open in detail view the selected menu and render it
 * and alos connecting with the database
 */
app.get('/menu/:id', function(req,res){
  const selectedId = req.params.id;
  mongoClient.connect(mongoDB, function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    const filter = {_id: ObjectID(selectedId)};
    collection.find(filter).toArray(function(error,documents){
      var selectedMenu = documents[0];
      client.close();
      res.render('menu', {menus:selectedMenu});
    })
  });
});

/**
 * edit menu calling the server and connect to the database 
 * and edit the menus then display in menu page
 */
app.get('/edit/:id', function(req,res){
  const selectedId = req.params.id;
  mongoClient.connect(mongoDB,function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    const filter = {_id: ObjectID(selectedId)}; 
    collection.find(filter).toArray(function(error,documents){
      var selectedMenu = documents[0];
      client.close();
      res.render('edit',{menus:selectedMenu});
    });
  });
});

/**
 * Create route for adding new menu 
 * and then can go back to the admin page and menu page 
 * to see the effect of the create
 */
 app.get('/create', function(req,res){
  mongoClient.connect(mongoDB, function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.find().toArray(function(error,documents){
      client.close();
      res.render('create', {menus:documents});
    });
  });
});

/**
 * This is the route for update menu and 
 * redirect it to edit page also can see
 * the effect in admin dashbord 
 */
app.post('/edit', urlEncodedParser, function(req, res){
  const selectedId = req.body._id;
  const filter = {_id: ObjectID(selectedId)};
  const set = {$set: {image: req.body.menuImage, name: req.body.menuName, description: req.body.menuDescription, price: req.body.price}};
  mongoClient.connect(mongoDB,function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.updateOne(filter,set,(err,result)=>{
      client.close();
      res.redirect('/edit/' + selectedId);
    });
  });
});
/**
 * this is to create a new menu and after updating
 * adding it to the backend which is the database
 * also displaying in menu page
 */
app.post('/menu', urlEncodedParser, function(req,res){
  const newMenu = {
    image: req.body.menuImage,
    name: req.body.menuName,
    description: req.body.menuDescription,
    price: req.body.price
  }
  mongoClient.connect(mongoDB, function(err, client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.insertOne(newMenu, function(err,result){
      client.close();
      res.redirect('/admin');
    })
  })
}); 

/**
 * This is to update the existing menu in to the page
 * and redirect to the menu page and add to database
 */
app.post('/menu', urlEncodedParser, function(req, res){
  const selectedId = req.body._id;
  const filter = {_id: ObjectID(selectedId)};
  const set = {$set: {name: req.body.menuName, description: req.body.menuDescription}};
  mongoClient.connect(mongoDB,function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.updateOne(filter,set, function(err,result){
      client.close();
      res.redirect('/edit/' + selectedId);
    });
  });
}); 

/**
 * route for detail page menu to display details 
 * and insert and edit then update 
 */
 app.get('/detail/:id', function(req, res){
  const selectedId = req.params.id;
  mongoClient.connect(mongoDB,function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    const filter = {_id: ObjectID(selectedId)};
    collection.find(filter).toArray(function(err,documents){
      var selectedMenu = documents[0];
      client.close();
      res.render('detail', {menus:selectedMenu});
    });
  });
});


/**
 * this is the route for deleting the menu
 * from the menu page and at the same time 
 * from database and page redirect to menu page
 */
app.get('/delete/:id',function(req,res){
  const selectedId = req.params.id; 
  mongoClient.connect(mongoDB,function(err,client){       
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');    
    const filter = {_id: ObjectID(selectedId)};
    collection.deleteOne(filter, function(err,result){
      client.close();
      res.redirect('/menu');
    });    
  });
});
/**
 * add a route for services page and 
 * render it to diplay the content
 */
app.get('/services/', function(req,res){
    res.render('services', {});
});

/**
 * a route for contact page and render it
 * to display the page
 */
app.get('/contact/', function(req,res){
    res.render('contact', {});
});

/**
 * adding a route for register page and 
 * render it to diplay the content of the page
 */
app.get('/register/', function(req,res){
    res.render('register', {});
});


// app.get('/register/', function(req,res, next){
//   res.render('register', {token: req.token()});
// });

//flash message
app.get('/register/', function(req, res) {
  template.render({
          flashMessages: res.locals.flash
      }, res);
});

app.post('/register/', function(req,res, next){
  res.redirect("/");
});

/**
 * a login page route  and render it 
 * to display the content of the page
 */
app.get('/login/', function(req,res){
    res.render('login', {});
});


app.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
      if (err) throw (err);
      res.redirect('/');
  })
})


/**
 * route for session store in a cookie for 5 days
 */
 app.post("/sessionLogin", (req,res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

admin
  .auth()
  .createSessionCookie(idToken, { expiresIn })
  .then(
    (sessionCookie) => {
      const options = { maxAge: expiresIn, httpOnly: true };
      res.cookie("session", sessionCookie, options);
      res.end(JSON.stringify({ status: "success" }));
    },
    (error) => {
      res.status(401).send("UNAUTHORISED REQUEST")
      red.redirect('/login');
    }
  )
});

/**
 * profile route for user and admin
 */
 app.get('/profile/', function(req,res){
 // const sessionCookie = req.cookies.session || ""
  //admin.auth().verifySessionCookie(sessionCookie, true)
    // .then(() => {
      res.render('profile')
    .catch(() => {
       res.redirect('/login');
    });
  });
 
/**
 * route for session cookie logout
 */
// app.get('/sessionLogOut', (req,res) => {
//   res.clearCookie('session');
//   res.redirect('/login');
// });

app.post('/cart', async (req,res) => {
  const menuData = req.body;
  const result = await (new menuModel(menuData)).save
  res.send('result');
});

/**
 * this is a route for admin to display m
 * menus and do the CRUD
 */
app.get('/admin', function(req,res){
  mongoClient.connect(mongoDB, function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.find().toArray(function(error,documents){
      client.close();
      res.render('admin', {menus:documents});
    });
  });
});

//flash message set for admin page
app.get('/admin', (req, res) => {
  req.flash("success", "flash message for a render method");
  res.render("/admin", { successes: req.flash("success") });
});


// firebase.auth().signOut().then(() => {
//   // Sign-out successful.
// }).catch((error) => {
//   // An error happened.
// });