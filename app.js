'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar rutas
console.log('****Cargando rutas*****');
var userRutes = require('./routes/RoutesUsers');
var followRoutes = require('./routes/RoutesFollows');

//middlewares
console.log('****Cargando middlewares*****');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/api',userRutes);

app.use('/api',followRoutes);
//cors
console.log('****Cargando cors*****');
//Exportar 
console.log('****Haciendo exports*****');
module.exports = app;