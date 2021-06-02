// adding an express server
const express = require('express');
// MongoClient has a connect method that allows us to connect to MongoDB using Node.j
const mongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();
const port = 3000;
//path to display images from the public folder
const path = require("path");
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
 * adding product array and looping throught each
 */
// const menus = [
//     { id: 1, name: 'Siga Tibsi', image: 'siga_tibis.jpg', description: 'Lamb cooked with spicy hot pepper, Tomato and spicy Eritrean sauce.'},
//     { id: 2, name: 'Kitfo', image: 'kitfo.jpg', description: 'Fresh lean ground beef marinated with spicy butter, chilli pepper, cottage.' },
//     { id: 3, name: 'Veggie Combo', image: 'veggie_combo.jpg', description: 'Our best vegetable cobination; Red lintels, Yellow spilit, collard gree, beets with potato, cabbage' },
//     { id: 4, name: 'Hamli Mis Siga', image: 'gomen_besiga.jpg', description: 'Lamb cubes,collard greens and onions gently cooked in butter with just a hint of cardamom. Served with injera(flat bread) or kicha(chapati)' },
//     { id: 5, name: 'Zilzil Tibsi', image: 'zilzil_tibis.jpg', description: 'Strips of charbroiled rib eye beef seasoned with garlic, black pepper, onion, green chilies with mitmita(hot papper) sauce. Served with ingera or bread.' },
//     { id: 6, name: 'Shiro', image: 'shiro.jpg', description: 'Spicy shiro (powedered chikpea) is cooked in the traditional style. You can order Shiro as a vegeterian dish and it comes in a taditional clay pot or in a bowl.' },
//     { id: 7, name: 'Beyanetu', image: 'beyanetu2.jpg', description: 'A sampling of 8 of our most popular vegetarian stews, meat stews, served on a platter of injera with lettuce, tomato and jalapeno salad  '},
//     { id: 8, name: 'Derho Tsebhi', image: 'dorowet.jpg', description: 'Spicy chicken stew slowly cooked in a mixture of diced onion, garlic, and berbere. Comes with thigh, drumstick and boiled egg. Served with injera. ' },
//     { id: 9, name: 'Shekila Tibisi', image: 'shekila_tibis.jpg', description: 'Pan fried goat meat with ribs, well-seasoned with rosemary, and green paper. Served with injera and salad' },
//     { id: 10, name: 'Ater kik Alicha', image: 'aterkik.jpg', description: 'Yellow split peas stewed in a special sauce with onions, garlic, turmeric, and ginger. Served with injera(flat bread), salad and homemade pittas or bread' },
//     { id: 11, name: 'Gored Gored', image: 'gored_gored.jpg', description: 'Very lean beef, warmed in spiced butte rare or medium, cooked with mitmita sauce, served with Salad with injera or bread ' },
//     { id: 12, name: 'Quanta Firfir', image: 'quanta_firfir.jpg', description: 'Dried beef stewed in berbere and sauce and black cardamom and other mixed spices. Served with injera(flat brad) and mixed salad.' }

// ]

/**
 * setting the pug engine to load the page
 * to use the css, js, and img file from the public folder to make it dynamic
 * to get the home page and display itby calling the function requeste and response
 */
app.set('view engine', 'pug');
//add the static public folder and configure express to use it such as css, js, img
app.use(express.static('public'));

/**
 *this is the root page route the index page 
 */
app.get('/', function(req,res){
    //connection to the database
  mongoClient.connect(dburl,function(err,client){
    const db = client.db('foods');
    const collection = db.collection('menu');
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

/**route for menu or product page
 *  and render the page
 */
app.get('/menu', function(req,res){
    res.render('menu',{});
});

/** a route for menu page and and filter menus
 * and open in detail view the selected menu and render it
 */
app.get('/menu/:id', function(req,res){
  const selectedId = req.params.id;
  mongoClient.connect(dburl, function(err,client){
    const db = client.db('foods');
    const collection = db.collection('menus');
    const filter = {_id: ObjectID(selectedId)};
    collection.find(filter).toArray(function(error,documents){
      var selectedMenu = documents[0];
      client.close();
      res.render('menu', {menu:selectedMenu});
    })
  });
});
app.post('/menu', urlEncodedParser, function(req,res){
  const newMenu = {
    name: req.body.menu,
    description: req.body.description
  }
  mongoClient.connect(dburl, function(err, client){
    const db = client.db('foods');
    const collection = db.collection('menus');
    collection.insertOne(newMenu, function(err,result){
      client.close();
      res.redirect('/');
    })
  })
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

/**
 * This is to add new menu and it in to menu page
 * and redirect to the menu page and add to database
 */
app.post('/menus', urlEncodedParser, function(req, res){
    const newId = menus[menus.length-1].id + 1 ;
    const newSuperHero = {
      id:newId,
      name: req.body.menu
    }
    menus.push(newMenu);
    res.redirect('/');
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
