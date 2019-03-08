const redis = require('redis');
const Promise = require('bluebird');
function RedisClient(app){
    let self = this;
    self.client = null;
    if(!self.client){
        self.client = redis.createClient(app.config.redis);
        self.client.on('error',err=>{
            console.log(err);
        });
        self.client.on('connect',()=>{
            console.log('connected to redis');
        });
    }
}

RedisClient.prototype.setKey = function(key,value){
    this.client.set(key,value,redis.print);
};

RedisClient.prototype.getValue = function(key){
    let self = this;
    return new Promise((resolve,reject)=>{
        self.client.get(key,function(err,res){
            if(err) reject(err);
            resolve(res);
        });
    });
};

module.exports = function(app){
    return new RedisClient(app);
};