'use strict';

var express = require('express');
var UserController = require('../controllers/UsersController');
var api = express.Router();
var auth = require("../middlewares/auhtenticate");
var multipart = require('connect-multiparty');
var mdUpload = multipart({uploadDir:'./upload/users'});

api.post('/guardarUsuario', UserController.guardarUsuario);
api.post('/login', UserController.login);
api.get('/getUsuario/:id',auth.usuarioLogueado,UserController.getUsuario);
api.get('/getUsuarios/:pagina?',auth.usuarioLogueado,UserController.getUsuarios);
api.put('/actualizarUsuario/:id',auth.usuarioLogueado,UserController.actualizarUsuario);
api.post('/subirImagen/:id',[auth.usuarioLogueado,mdUpload],UserController.subirImagen);
api.get('/getImagen/:imagen',auth.usuarioLogueado,UserController.getImagen);
module.exports = api;