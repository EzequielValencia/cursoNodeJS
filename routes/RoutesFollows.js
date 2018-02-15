'use strict';
var express = require('express');
var FollowController = require('../controllers/FollowController');
var middlewareAuth = require('../middlewares/auhtenticate');
var api = express.Router();

api.post('/guardarSeguidor',middlewareAuth.usuarioLogueado,FollowController.guardarSeguidor);
api.delete('/dejarDeSeguir/:seguido',middlewareAuth.usuarioLogueado,FollowController.dejarDeSeguir);
api.get('/listadoDeUsuariosSeguidos/:id?/:pagina?',middlewareAuth.usuarioLogueado,FollowController.listadoDeUsuariosSeguidos);
api.get('/listadoDeUsuariosQueMeSiguen/:id?/:pagina?',middlewareAuth.usuarioLogueado,FollowController.listadoDeUsuariosQueMeSiguen);
api.get('/listaDeSeguidosOSeguidores/:seguidores?',middlewareAuth.usuarioLogueado,FollowController.listaDeSeguidosOSeguidores);

module.exports = api;