let _ = require('lodash');
module.exports = function(app){
    let ret = {};

    _.forOwn(app.config.database,(db,name)=>{
        if(process.env.NODE_ENV === 'production' && process.env.INSTANCE_CONNECTION_NAME ){
            db.user = process.env.SQL_USER;
            db.password = process.env.SQL_PASSWORD;
            db.connection.database = process.env.SQL_DATABASE;
            db.connection.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
        }
        let knex = require('knex')(db);
        ret[name]= require('bookshelf')(knex);
    });

    return ret;
};