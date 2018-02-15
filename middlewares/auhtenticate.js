"use strict";

var jwt = require("jwt-simple");
var moment = require('moment');
var secret = "clave_secreta_red_social_angular";

exports.usuarioLogueado = function(req,res,next){
    if(!req.headers.authorization){
        return res.status(403).send({mensaje:"La peticion no tiene la cabecera de autenticacion"});
    }
  
    var token = req.headers.authorization.replace(/['"]+/g,'');
    try{
        var payload = jwt.decode(token,secret);
        if(payload.exp<=moment().unix()){
            return res.status(401).send({mensaje:"El token a expirado"});
        }
    }catch(ex){
        return res.status(404).send({mensaje:"El token no es valido"});
    }
    req.user = payload;
    next();
};