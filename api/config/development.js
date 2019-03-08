module.exports = {
    database:
        {
            internetCafe: {
                client: 'mysql',
                connection: {
                    host: 'localhost',
                    user: 'root',
                    password: 'bacon123',
                    database: 'internet_cafe_dev',
                    charset: 'utf8',
                    timezone: 'UTC'
                },
                migrations: {
                    directory: './migrations'
                },
                seeds: {
                    directory: './seeds'
                }
            }
        },
    host:'localhost',
    port:36000,
    redis:{
        host:'127.0.0.1',
        port:6379
    }
};