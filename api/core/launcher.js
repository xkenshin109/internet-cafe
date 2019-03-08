const express = require('express');
const bodyParser = require('body-parser');
const oauth = require('oauth2-server');
const Promise = require('bluebird');
const http = require('http');

function Launcher(){
    let self = this;
    self.app = express();
    self.app.use(bodyParser.json({limit:'4mb'}));
    self.app.use(bodyParser.urlencoded({extended:true}));
    self.app.config = require('./configLoader')();
    self.app.redis = require('../services/redis-cli')(self.app);
    self.app.databases = require('./databaseLoader')(self.app);
    self.app.migrator = require('./migratorLoader')(self.app);
    self.app.models = require('./modelLoader')(self.app);
    self.app.middleware = require('./middlewareLoader')(self.app);
    // let models = ;
    self.app.oauth2 = new oauth({
        model: require('../services/inMemoryCache')(self.app)
    });
    require('./RouteLoader')(self.app);
    self.httpServer = http.createServer(self.app);
}
Launcher.prototype.run = function(){
    let self = this;
    return Promise.resolve()
        .then(()=>{
            return self.app.migrator.run();
        })
        .then(()=>{
            return self.httpServer.listen(self.app.config.port,'localhost');
        });
};
module.exports = new Launcher();