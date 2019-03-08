const glob = require('glob');
const path = require('path');
module.exports = function(){
    let ret = {};
    glob.sync('./config/**/*.js').forEach(file=>{
        let name = path.basename(file,'.js');
        ret[name] = require(path.resolve(file));
    });
    return ret[process.env.NODE_ENV || 'development'];
};