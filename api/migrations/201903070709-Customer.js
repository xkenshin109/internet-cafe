let seeds = require('../seeds/Customer');
const Promise = require('bluebird');
const upsert = require('../utils/upsert');
module.exports = {
    up: function(knex){
        return knex.schema.createTable('Customer',function(table){
            table.uuid('id').primary();
            table.string('name',100).nullable();
            table.string('picture').nullable();
            table.float('money').notNullable();
            table.integer('happiness').defaultTo(0).notNullable();
            table.integer('hunger').defaultTo(0).notNullable();
            table.integer('bladder').defaultTo(0).notNullable();
            table.integer('height').defaultTo(50);
            table.integer('width').defaultTo(50);
            table.timestamps(true,true);
        })
            .then(()=>{
                return Promise.mapSeries(seeds,s=>{
                    return upsert(knex,'Customer',s);
                });
            });
    },
    down:function(knex){
        return knex.schema.dropTable('Customer');
    }
};
