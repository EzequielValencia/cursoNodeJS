'use strict';

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var Usuario = require('../models/user');
var Seguidor = require('../models/seguidor');

var FollowController = {
    guardarSeguidor:(req,res)=>{
        var params = req.body;
        var follow = new Seguidor();
        follow.seguidor=req.user.sub;
        follow.seguido = params.seguido;
        follow.save((err,followStored)=>{
           if(err) return res.status(500).send({mensaje:"Error al guardar el seguimiento"});
           if(followStored) return res.status(200).send({mensaje:"usuario guardado correctamente",
               followStored});
           return res.status(404).send({mensaje:"El seguimiento no se ha guardado"});
        });
    },
    dejarDeSeguir:(req,res)=>{
        var usuarioId = req.user.sub;
        var seguidoId = req.params.seguido;
        
        Seguidor.find({'seguidor':usuarioId,'seguido':seguidoId}).remove(err=>{
           if(err) return res.status(500).send({mensaje:'No se pudo eliminar el seguimiento'});
           return res.status(200).send({mensaje:"seguimiento eliminado correctamente"});
        });
    },
    /*
     *Devuelve la lista de usuarios que sigo paginados
     */
    listadoDeUsuariosSeguidos:function(req,res){
        var usuarioId = req.user.sub;
        console.log(usuarioId)
        if(req.params.id){
            usuarioId = req.params.id;
        }
        
        var pagina = 1;
        if(req.params.pagina){
            pagina=req.params.pagina;
        }
        
        var itemsPorPagina = 4;
        
        Seguidor.find({seguidor:usuarioId}).populate({path:'seguido'}).paginate(pagina,itemsPorPagina,
        (err,seguidores,total)=>{
            if(err) return res.status(500).send({mensaje:"Error al cargar los seguidores"});
            if(!seguidores){
                return res.status(404).send({mensaje:"No estas siguiendo a nadie"});
            }else{
                return res.status(200).send({total,seguidores,paginas:Math.ceil(total/itemsPorPagina)});
            }
        });
    },
    /*
     *Devuelve la lista de usuarios que me siguen paginados
     */
    listadoDeUsuariosQueMeSiguen:function(req,res){
        var usuarioId = req.user.sub;
        
        if(req.params.id){
            usuarioId = req.params.id;
        }
        
        var pagina = 1;
        if(req.params.pagina){
            pagina=req.params.pagina;
        }
        
        var itemsPorPagina = 4;
        
        Seguidor.find({seguido:usuarioId}).populate('seguidor seguido').paginate(pagina,itemsPorPagina,
        (err,seguidores,total)=>{
            if(err) return res.status(500).send({mensaje:"Error al cargar los seguidores"});
            if(!seguidores){
                return res.status(404).send({mensaje:"No te sigue ningun usuario"});
            }else{
                return res.status(200).send({total,seguidores,paginas:Math.ceil(total/itemsPorPagina)});
            }
        });
    },
    /*
     *Devuelve la lista de usuarios seguidos o seguidores
     */
    listaDeSeguidosOSeguidores:function(req,res){
        var usuarioId = req.user.sub;
        var seguidores = req.params.seguidores;
        var busqueda={};
        if(seguidores){
            busqueda = {seguido:usuarioId};
        }else{
            busqueda = {seguidor:usuarioId};
        }
        Seguidor.find(busqueda).populate('seguidor seguido').exec((err,seguidores)=>{
            if(err) return res.status(500).send({mensaje:"Se produjo un error en la busqueda"});
            if(!seguidores) return res.status(404).send({mensaje:"No se localizo tu requerimiento"});
            return res.status(200).send(seguidores);
        });
    }
};

module.exports = FollowController;