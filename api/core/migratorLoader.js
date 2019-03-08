const _ = require('lodash');
const Promise = require('bluebird');


function Migrator(app){
    let self = this;
    self.app = app;
}

Migrator.prototype.run = function(){
    let self = this;
    let current = Promise.resolve();
    _.mapValues(self.app.databases,function(db){
        current = current.then(()=>{
            return db.knex.migrate.latest();
        });
    });

    return current;
};

module.exports = function(app){return new Migrator(app)};