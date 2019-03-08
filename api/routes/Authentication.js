module.exports = function(app){
    let endpoints = {
        'POST|/oauth/requestToken':[
            app.middleware.authentication.getAccessToken
        ],
    };
    return endpoints;
};
