const Promise = require('bluebird');
const saltRounds = 10;
const bcrypt = require('bcrypt');
function InMemoryCache(app) {
    this.app = app;
    this.clients = [
        {
            clientId : 'dummy-client-id',
            clientSecret : 'dummy-client-secret',
            redirectUris : ['/Failure'],
            // grants: ['password'],
            grants: ['password','client_credentials']
        }];

    this.tokens = [];

    this.users = [{ id : '123', username: 'jfoster', password: '$2b$10$T9/5bvsbPhlKxs/YLBteruoxJ8BiBPWoywq6AjgSvKVKDZdiQL0tm' }];
}

/**
 * Dump the cache.
 */
InMemoryCache.prototype.dump = function() {
    console.log('clients', this.clients);
    console.log('tokens', this.tokens);
    console.log('users', this.users);
};

/*
 * Get access token.
 */
InMemoryCache.prototype.getAccessToken = function(bearerToken) {
    //console.log('called getAccessToken, bearerToken=', bearerToken);
    // return this.tokens.length?this.tokens[0]: false;
    return this.app.redis.getValue(bearerToken)
        .then((token)=>{
            if(!token) return false;
            let parsedToken = JSON.parse(token);
            parsedToken['accessTokenExpiresAt'] = new Date(parsedToken['accessTokenExpiresAt']);
            parsedToken['refreshTokenExpiresAt'] = new Date(parsedToken['refreshTokenExpiresAt']);
            return parsedToken;
        });
};

/**
 * Get refresh token.
 */
InMemoryCache.prototype.getRefreshToken = function(bearerToken) {
    //console.log('called getRefreshToken, bearerToken=', bearerToken);
    let tokens = this.tokens.filter(function(token) {
        return token.refreshToken === bearerToken;
    });

    return tokens.length ? tokens[0] : false;
};

/**
 * Get client.
 */
InMemoryCache.prototype.getClient = function(clientId, clientSecret) {
    //console.log(`called InMemoryCache.getClient - clientId=${clientId}, clientSecret=${clientSecret}`);
    return this.app.models['AccessKey']
        .where({
            client_id:clientId,
            client_secret: clientSecret
        })
        .fetch()
        .then(client=>{
            if(!client) return false;
            let res = client.attributes;
            res.grants = res.grants.split(',');
            res.redirect_uris = res.redirect_uris.split(',');
            return client.attributes;
        });
};

/**
 * Save token.
 */
InMemoryCache.prototype.saveToken = function(token, client, user) {
    //console.log('called saveToken', arguments);
    let newToken = {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        userId: user.id,

        //these are required in /node_modules/express-oauth-server/node_modules/oauth2-server/lib/models/token-model.js
        client: client,
        user:user,
        scope: null, //where are we taking scope from? maybe client?
    };
    this.app.redis.setKey(token.accessToken,JSON.stringify(newToken));
    this.tokens.push(newToken);
    return newToken;
};

/*
 * Get user.
 */
InMemoryCache.prototype.getUser = async function(username, password) {
    let user = await this.getFacebookUser(username);
    if(user){return true;}
    user = await this.getUserFromDb(username);
    if(!user) return false;
    let authenticated = await this.verifyUser(password, user.password);
    if(authenticated){
        return user;
    }
    return false;
};

InMemoryCache.prototype.getUserFromClient = function(client){
    //console.log('called prototype.getUserFromClient', arguments);
    //todo: find correct user.
    return this.users[0];
};

InMemoryCache.prototype.saveAuthorizationCode = function(){
    console.log('how is this implemented!?', arguments);
};

InMemoryCache.prototype.verifyUser = function(password,user_password){
    return new Promise((resolve,reject)=>{
        return bcrypt.compare(password,user_password,function(err,res){
            resolve(res);
        });
    });
};
InMemoryCache.prototype.getFacebookUser = function(email){
    return this.app.models["Facebook"]
        .where({email:email})
        .fetch()
        .then(account=>{
            if(!account) return null;
            return account.attributes;
        });
};
InMemoryCache.prototype.getUserFromDb = function(email){
    return this.app.models["Account"]
        .where({email:email})
        .fetch()
        .then((account)=>{
            if(!account){
                return null;
            }
            return account.attributes;
        })

};
/**
 * Export constructor.
 */
module.exports = function(app){
    return new InMemoryCache(app);
};