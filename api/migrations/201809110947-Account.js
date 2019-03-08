let seeds = require('../seeds/Account');
const Promise = require('bluebird');
const upsert = require('../utils/upsert');
module.exports = {
    up: function(knex){
        return knex.schema.createTable('Account',function(table){
            table.uuid('id').primary();
            table.string('name',100).nullable();
            table.string('password',300).notNullable();
            table.string('email',100).notNullable();
            table.binary('profile_pic').nullable();
            table.uuid('Owner_id').references('id').inTable('Owner');
            table.timestamps(true,true);
        })
            .then(()=>{
                return Promise.mapSeries(seeds,s=>{
                   return upsert(knex,'Account',s);
                });
            });
    },
    down:function(knex){
        return knex.schema.dropTable('Account');
    }
};
