let seeds = require('../seeds/Product');
const Promise = require('bluebird');
const upsert = require('../utils/upsert');
module.exports = {
    up: function(knex){
        return knex.schema.createTable('Product',function(table){
            table.uuid('id').primary();
            table.string('name',100).nullable();
            table.float('price').notNullable();
            table.integer('happiness').defaultTo(0).notNullable();
            table.integer('hunger').defaultTo(0).notNullable();
            table.integer('bladder').defaultTo(0).notNullable();
            table.string('picture').nullable();
            table.timestamps(true,true);
        })
            .then(()=>{
                return Promise.mapSeries(seeds,s=>{
                    return upsert(knex,'Product',s);
                });
            });
    },
    down:function(knex){
        return knex.schema.dropTable('Product');
    }
};
