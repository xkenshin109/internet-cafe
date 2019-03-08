let bcrypt = require('bcrypt');
const saltRounds = 10;
let oauth = require('oauth2-server');

module.exports = function(app){
    let ret = {};

    ret.hashPassword = function(req,res,next){
        let passwordToHash = req.body.password;
        return bcrypt.genSalt(saltRounds)
            .then((err,salt)=>{
                return bcrypt.hash(passwordToHash,salt)
                    .then((err,res)=>{
                        req.body.password = res;
                        next();
                    });
            });
    };

    ret.checkUser = function(req,res,next){
        let password = req.body.password;
        let hashed_password = req.body.account.password;
        return bcrypt.compare(password,hashed_password)
            .then((result)=>{
                delete req.body.hashed_password;
                if(result){
                    return res.status(200).json(req.body);
                }
            });
    };

    ret.getAccessToken = function(req,res,next){
        let request = new oauth.Request(req);
        let response = new oauth.Response(res);
        return app.oauth2
            .token(request,response)
            .then(function(token){
                delete token.user.password;
                delete token.user.created_at;
                delete token.user.updated_at;
                app.redis.setKey(token.accessToken,JSON.stringify(token));
                return res.json({
                    success:true,
                    data:{
                        accessToken: token.accessToken,
                        refreshToken: token.refreshToken,
                        account: token.user
                    },
                    message:'use this access token'
                });
            })
            .catch(function(err){
                return res.status(400).json({
                    success:false,
                    data:null,
                    message:err.message
                });
            });
    };
    ret.authenticateRequest = async function(req,res,next){
        let request = new oauth.Request(req);
        let response = new oauth.Response(res);

        try{
            let authenticate = await app.oauth2.authenticate(request,response);
            if (!authenticate) {
                throw new Error('no token was found');
            }
            next();
        }catch(err){
            return res.status(err.code || 500).json(err);
        }
    };
    return ret;
};