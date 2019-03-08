"use strict";
module.exports = function(knex, tableName, row){
    return knex(tableName).where(row).then(result=>{
        if(result && result.length !== 0) return;
        return knex(tableName).insert(row);
    })
}
