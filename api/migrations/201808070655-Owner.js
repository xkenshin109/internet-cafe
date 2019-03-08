let seeds = require('../seeds/Owner');
const Promise = require('bluebird');
const upsert = require('../utils/upsert');
module.exports = {
    up: function(knex){
        return knex.schema.createTable('Owner',function(table){
            table.uuid('id').primary();
            table.float('money').defaultTo(5000).nullable();
            table.integer('total_days').defaultTo(0);
            table.timestamps(true,true);
        })
            .then(()=>{
                return Promise.mapSeries(seeds,s=>{
                    return upsert(knex,'Owner',s);
                });
            });
    },
    down:function(knex){
        return knex.schema.dropTable('Owner');
    }
};
