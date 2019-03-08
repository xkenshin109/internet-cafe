"use strict";
let glob = require('glob');
let path = require('path');
let _ = require('lodash');

module.exports = function(app){

    let ret = {};
    glob.sync( './controllers/**/*Controller.js' ).forEach( function( file ) {
        let name = path.basename(file,'Controller.js');
        ret[name] = require(path.resolve( file ))(app);

    });

    _.forOwn(app.models, (model, name) => {

        if(ret[name]===undefined){
            ret[name] = {};
        }

        ret[name].findAll = function(req, res, next){
            model.fetchAll().then(function(values){

                let data = {
                    success: true,
                    data:values.models,
                    message:''
                };
                return res.status(200).json(data);
                //return res.status(200).json(data);
                //end the dumb
            })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };

        ret[name].findOne = function(req, res, next){
            return model.where({id:Number(req.params.id)})
                .fetch()
                .then((value) =>{
                    let data = {
                        success: true,
                        data:value,
                        message:''
                    };
                    return res.status(200).json(data);
                    //return res.status(200).json(data);
                    //end the dumb
                })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };

        ret[name].addOne = function(req,res,next){
            if(req.body.id === 0){
                delete req.body.id;
            }
            return model.forge(req.body).save().then(function(value){
                let data = {
                    success:true,
                    data: value.attributes,
                    message:''
                };
                if(value.tableName === 'SiteListing'){
                    value.newListing();
                }

                return res.status(200).json(data);
            })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };

        ret[name].putOne = function(req,res,next){
            return model.forge({id:Number(req.params.id)}).save(req.body)
                .then(function(value){
                    let data = {
                        success:true,
                        data: value.attributes,
                        message:''
                    };
                    return res.status(200).json(data);
                    //end the dumb
                })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };

        ret[name].delete = function(req,res,next){
            return model.forge({id:Number(req.params.id)}).destroy().then(function(value){
                res.body = value;
                return res.json('success');
            })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };

        ret[name].findOneAssociation = function(req,res,next){
            return model.forge({id:Number(req.params.id)}).fetch({
                withRelated: [req.params.association]
            }).then(function(value){
                let data = {
                    success:true,
                    data: value.related(req.params.association),
                    message:''
                };
                return res.status(200).json(data);
                //end the dumb
            })
                .catch((error)=>{
                    return res.status(500).json(error.message);
                });
        };
    });

    return ret;
};
