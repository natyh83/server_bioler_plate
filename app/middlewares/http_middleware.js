// bound to express

const Middleware = {

    OptionsMiddleware: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Content-Length, X-Requested-With, X-Total-Count, If-None-Match');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', 86400);
        res.status(200).end();
    },

    PostMiddleware: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'POST');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,Origin, Content-Length, X-Requested-With, X-Total-Count');
        next();
    },

    PutMiddleware: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'PUT');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,Origin, Content-Length, X-Requested-With, X-Total-Count');
        next();
    },

    GetMiddleware: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,Origin, Content-Length, X-Requested-With, X-Total-Count, If-None-Match');
        next();
    },

    DeleteMiddleware: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'DELETE');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,Origin, Content-Length, X-Requested-With, X-Total-Count');
        next();
    }
}

module.exports = Middleware;


