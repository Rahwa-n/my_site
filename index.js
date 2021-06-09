// adding an express server
const express = require('express');
// MongoClient has a connect method that allows us to connect to MongoDB using Node.j
const mongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();
const port = 3000;
//path to display images from the public folder
const path = require("path");
const multer = require('multer');

/**
 * set up MongoDB url to connect with
 * This method accepts the MongoDB server address (url) and a callback function
 */
const dburl = "mongodb://localhost:27017"
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({extended:false});
mongoClient.connect(dburl,function(err,client){
  console.log('connected with DB');
});

/**
 * setting the pug engine to load the page
 * to use the css, js, and img file from the public folder to make it dynamic
 * to get the home page and display itby calling the function requeste and response
 */
app.set('view engine', 'pug');
//set the static public folder and configure express to use it such as css, js, img
app.use(express.static(path.join(__dirname,'public')));

/**
 *this is the root page route the index page 
 */
app.get('/', function(req,res){
    //connection to the database
  mongoClient.connect(dburl,function(err,client){
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
  mongoClient.connect(dburl, function(err,client){
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
  mongoClient.connect(dburl, function(err,client){
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
  mongoClient.connect(dburl,function(err,client){
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

//update menu
app.post('/edit', urlEncodedParser, function(req, res){
  const selectedId = req.body._id;
  const filter = {_id: ObjectID(selectedId)};
  const set = {$set: {image: req.body.menuImage, name: req.body.menuName, description: req.body.menuDescription, price: req.body.price}};
  mongoClient.connect(dburl,function(err,client){
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
  mongoClient.connect(dburl, function(err, client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.insertOne(newMenu, function(err,result){
      client.close();
      res.redirect('/menu');
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
  mongoClient.connect(dburl,function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.updateOne(filter,set, function(err,result){
      client.close();
      res.redirect('/edit/' + selectedId);
    });
  });
});

/**
 * route for detail page menu to display details and insert and edit then update 
 */
 app.get('/detail/:id', function(req, res){
  const selectedId = req.params.id;
  mongoClient.connect(dburl,function(err,client){
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
  mongoClient.connect(dburl,function(err,client){       
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

/**
 * a login page route  and render it 
 * to display the content of the page
 */
app.get('/login/', function(req,res){
    res.render('login', {});
});

app.get('/user', (req, res) => {
  res.render("user", { title: "Profile", userProfile: { nickname: "Auth0" } });
});


/**
 * this is a local server listen in port number 3000
 * and it can be added other port number too
 */
app.listen(3000, function(){
    console.log(`Node.js Project Started on port ${port}`);
});

app.get('/admin', function(req,res){
  mongoClient.connect(dburl, function(err,client){
    const myDb = client.db('foods');
    const collection = myDb.collection('menus');
    collection.find().toArray(function(error,documents){
      client.close();
      res.render('admin', {menus:documents});
    });
  });
});
