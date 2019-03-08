let seeds = require('../seeds/AccessKey');
const Promise = require('bluebird');
const upsert = require('../utils/upsert');
module.exports = {
    up: function(knex){
        return knex.schema.createTable('AccessKey',function(table){
            table.uuid('id').primary();
            table.string('client_id',100).nullable();
            table.string('client_secret',100).nullable();
            table.string('grants',300).notNullable();
            table.string('redirect_uris',100).notNullable();
            table.timestamps(true,true);
        })
            .then(()=>{
                return Promise.mapSeries(seeds,s=>{
                    return upsert(knex,'AccessKey',s);
                });
            });
    },
    down:function(knex){
        return knex.schema.dropTable('AccessKey');
    }
};
