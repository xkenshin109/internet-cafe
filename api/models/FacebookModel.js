module.exports= function(app){
    return app.databases.internetCafe.Model.extend({
        tableName:'Facebook'
    });
};