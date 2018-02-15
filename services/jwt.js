"use strict";

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave_secreta_red_social_angular";

exports.createToken = (usuario)=>{
    var payLoad = {
        sub:usuario._id,
        nombre:usuario.nombre,
        nick:usuario.nick,
        email:usuario.email,
        avatar:usuario.avatar,
        iat:moment().unix(),
        exp:moment().add(30,'days').unix
    };
    
    return jwt.encode(payLoad,secret);
};


