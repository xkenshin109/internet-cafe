"use strict";
let glob = require('glob');
let path = require('path');
let _ = require('lodash');

module.exports = function(app){
    glob.sync('./routes/**/*.js').forEach(file=>{
        let routeModel = require(path.resolve(file))(app);
        for(let property in routeModel){
            try{
                let method = property.split("|")[0];
                let endpoint = property.split("|")[1];
                let arr = routeModel[property];
                if(method === 'GET'){
                    app.get(endpoint,arr);
                }
                if(method === "POST"){
                    app.post(endpoint,arr);
                }
                if(method === "PUT"){
                    app.use(endpoint,arr);
                }
                if(method === "DELETE"){
                    app.use(endpoint,arr);
                }
            }catch(e){
                console.log(e);
            }

        }
    });
};
