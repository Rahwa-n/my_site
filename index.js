const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;
const dburl = "mongodb://localhost:27017"
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({extended:false});
mongoClient.connect(dburl,function(err,client){
  console.log('connected with DB');
});


const menus = [
    { id: 1, name: 'Siga Tibsi', image: 'siga_tibis.jpg' },
    { id: 2, name: 'Kitfo', image: 'kitfo.jpg' },
    { id: 3, name: 'Veggie Combo', image: 'veggie_combo.jpg' },
    { id: 4, name: 'Hamli Mis Siga', image: 'gomen_besiga.jpg' },
    { id: 5, name: 'Zilzil Tibsi', image: 'zilzil_tibis.jpg' },
    { id: 6, name: 'Shiro', image: 'shiro.jpg' }
]


/**
 * setting the pug engine to load the page
 * to use the css, js, and img file from the public folder to make it dynamic
 * to get the home page and display itby calling the function requeste and response
 */
app.set('view engine', 'pug');
app.use(express.static('public'));
app.get('/', function(req,res){
    res.render('index',{});
});

app.get('/about/', function(req,res){
    res.render('about', {});
});

app.get('/menu', function(req,res){
    res.render('menu',{menus: menus});
});

app.get('/menu/:id', function(req,res){
    const selectedId = req.params.id;
    let selectedMenu = menus.filter(menu => {
      return menu.id == selectedId;
    });
    selectedMenu = selectedMenu[0];
    res.render('menu', {menu:selectedMenu});
}); 

app.get('/services/', function(req,res){
    res.render('services', {});
});

app.get('/contact/', function(req,res){
    res.render('contact', {});
});

app.get('/register/', function(req,res){
    res.render('register', {});
});

app.get('/login/', function(req,res){
    res.render('login', {});
});


app.listen(3000, function(){
    console.log('Node.js Project Started on port ${port}');
});
