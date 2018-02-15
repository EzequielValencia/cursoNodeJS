'use strict';

var Usuario = require('../models/user');
var Seguidor = require('../models/seguidor');
var mongoosePaginate = require('mongoose-pagination');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');


/**
 * Funcion para el login de los usuarios
 * @param {type} req 
 * @param {type} res
 * @returns {undefined}
 */
function login(req,res){
    var parametros = req.body;
    var email = parametros.email;
    var password = parametros.password;

    Usuario.findOne({email:email},(err,usuarioEncontrado)=>{

        if(err) return res.status(500).send({mensaje:"Error al buscar el usuario"});
        if(usuarioEncontrado){
            bcrypt.compare(password,usuarioEncontrado.password,(err,check)=>{
                if(err) return res.status(500).send({mensaje:"Error"});
                if(check){
                    if(parametros.getToken){
                        return res.status(200).send({
                            token:jwt.createToken(usuarioEncontrado)
                        });
                    }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send(usuarioEncontrado);
                    }
                }else{
                    return res.status(404).send({mensaje:"No se ha identificado al usuario"});
                }
            });
        }else{
            return res.status(404).send({mensaje:"No se ha identificado al usuario!!"});
        }
    });
}
/**
 * Funcion para guardar a los usuarios que se registran
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
function guardarUsuario (req,res){
    var parametros = req.body;
    var usuario = new Usuario();
    if(parametros.nombre && parametros.apellidos && 
        parametros.nick && parametros.email && parametros.password){

        usuario.nombre = parametros.nombre;
        usuario.apellidos = parametros.apellidos;
        usuario.nick = parametros.nick;
        usuario.email = parametros.email ;

        Usuario.find({
            $or:[
                {nick: usuario.nick.toLowerCase()},
                {email: usuario.email.toLowerCase()}
                ]
        }).exec((err,users)=>{
            console.log(users.length);
            if(err){
                return res.status(500).send({errror:"Error al buscar el usuario"});
            }
            if(users && users.length>=1){
                console.log("El usuario existe");
                return res.status(200).send({error:"El usuario ya existe"});
            }else{
                console.log("Guardando el usuario");
                bcrypt.hash(parametros.password,null,null,(err,hash)=>{
                    usuario.password = hash;

                    usuario.save((err,usuarioAlmacenado)=>{
                    if(err){
                        return res.status(500).send({mensaje:"Error al guardar el usuario"});
                    }else if(usuarioAlmacenado){
                        res.status(200).send({user:usuarioAlmacenado});
                    }else{
                        res.status(404).send({mensaje:"No se ha registrado el usuario"});
                    }
                    });
                });
            }
        });
    }else{
        res.status(500).send({
                mensaje:"Falta alguno de los campos"
        });
    }
}
/**
 * Retorna los datos del usuario solicitado
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
function getUsuario(req,res){
    var userId = req.params.id;
    Usuario.findById(userId,(err,usuario)=>{
        if(err) res.status(500).send({mensaje:"Error en la peticion"});
        if(!usuario) res.status(404).send({mensaje:"El usuario no existe"});
        Seguidor.findOne({seguidor: req.user.sub , seguido:userId}).exec((err,seguimiento)=>{
            if(err) res.status(500).send({mensaje:"Error al buscar el seguimiento"});
            return res.status(200).send({usuario,seguimiento});    
        });

    });
}

function getUsuarios(req,res){
    var identityUserId = req.user.sub;
    var pagina = 1;
    if(req.params.pagina){
        pagina = req.params.pagina;
    }

    var itemsPorPagina = 5;

    Usuario.find().sort('_id').paginate(pagina,itemsPorPagina,(err,usuarios,total)=>{
        if(err) return res.status(500).send({mensaje:"Error en la consulta"});
        if(!usuarios) return res.status(404).send({mensaje:"No hay usuarios disponibles"});
        idSeguidores(identityUserId).then((value)=>{
            console.log(value);
            return res.status(200).send({
                usuarios,
                total,
                paginasTotales:Math.ceil(total/itemsPorPagina),
                value
            });
        });

    });
}

async function idSeguidores(userId){
    
    var seguidos = await Seguidor.find({seguidor:userId}).select({_id:0,__v:0,seguidor:0})
            .exec((err,seguidos1)=>{
       console.log("Seguidos ");
       console.log(seguidos1);
       return seguidos1; 
    });
    
    var seguidores = await Seguidor.find({seguido:userId}).select({_id:0,__v:0,seguido:0})
            .exec((err,seguidores1)=>{
        console.log("Seguidores ");
        console.log(seguidores1);
        return seguidores1; 
    });
    
    return {seguidos:seguidos,seguidores:seguidores};
}

function actualizarUsuario(req,res){
    var idUsuario = req.params.id;
    var update = req.body;

    delete update.password;

    if(idUsuario!==req.user.sub){
        return res.status(500).send({mensaje:'no tienes permiso para actualizar los datos del usuario'});
    }

    Usuario.findByIdAndUpdate(idUsuario,update,{new:true},(err,usuarioActualizado)=>{
       if(err) return res.status(500).send({mensaje:"Error en la peticion"});
       if(!usuarioActualizado) return res.status(404).send({mensaje:"no se ha podido actualizar el usuario"});

       return res.status(200).send({mensaje:"Datos actualizados correctamente",usuarioActualizado});
    });
}

function subirImagen(req,res){
    var idUsuario = req.params.id;

    if(req.files){
        var filePath = req.files.imagen.path;
        var file_split = filePath.split('\\');
        var nombreArchivo = file_split[2];
        var extencionSplit = nombreArchivo.split('\.');
        var extencion = extencionSplit[1];


        if(idUsuario!==req.user.sub){
            return borraArchivosSubidos(filePath,res,500,
                                    'no tienes permiso para actualizar los datos del usuario');
        }

        if(extencion==='png' || extencion==='jpg' || extencion==='jpeg' || extencion==='gif'){
            Usuario.findByIdAndUpdate(idUsuario,{avatar:nombreArchivo},{new:true},
            (err,usuarioActualizado)=>{
                if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                if(!usuarioActualizado) return res.status(404).send({mensaje:"no se ha podido actualizar el usuario"});

                return res.status(200).send({mensaje:"Datos actualizados correctamente",usuarioActualizado});
            });

        }else{
           return borraArchivosSubidos(filePath,res,200,"La extencion del archivo no es valida");
        }
    }else{
        return res.status(200).send({mensaje:"No se han subido imagenes"});
    }
}
/*
*/
function getImagen(req,res){
    var archivoImagen = req.params.imagen;
    var pathImagen = './upload/users/'+archivoImagen;

    fs.exists(pathImagen,(existe)=>{
            if(existe){
                    return res.sendFile(path.resolve(pathImagen));
            }else{
                    return res.status(404).send({mensaje:"No existe la imagen"});
            }
    });
}


function borraArchivosSubidos(filePath,res,status,mensaje){
    fs.unlink(filePath,(err)=>{
        return res.status(status).send({mensaje:mensaje});
    });
}

async function idSeguidores(userId){
    
    var seguidos = await Seguidor.find({seguidor:userId}).select({_id:0,__v:0,seguidor:0}).exec((err,seguidos)=>{
       console.log("Seguidos "+JSON.stringify(seguidos));
       return seguidos; 
    });
    
    var seguidores = await Seguidor.find({seguido:userId}).select({_id:0,__v:0,seguido:0}).exec((err,seguidores)=>{
        console.log("Seguidores "+JSON.stringify(seguidores));
        return seguidores; 
    });
    
    return {seguidos:seguidos,seguidores:seguidores};
}
module.exports ={
    getImagen,
    subirImagen,
    actualizarUsuario,
    getUsuario,
    getUsuarios,
    guardarUsuario,
    login};