const express = require('express');
const app = express();
const port = 3000;

app.get('/about', function(req,res){
  res.render('about',{});
});