const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const Middleware = require('../../middlewares/http_middleware');

class Server {
    constructor() {
        this.app = express();
        this.port = parseInt(process.env.SERVER_PORT || 8181, 10);
        this.httpServer = null;
        this.init();
    }

    bindHeaders() {
        this.app.options('/*', Middleware.OptionsMiddleware);
        this.app.put('/*', Middleware.PutMiddleware);
        this.app.post('/*', Middleware.PostMiddleware);
        this.app.get('/*', Middleware.GetMiddleware);
        this.app.delete('/*', Middleware.DeleteMiddleware);
    }


    init() {
        try {
            this.app.use(cookieParser());
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({'extended': 'true'}));
        } catch (err) {
            throw(err);
        }


    }

    listen() {
        this.httpServer = http.createServer(this.app);
        this.httpServer.listen(this.port, () => {

            console.log(`server is running at ${this.port}`);
        });
    }

}

module.exports = Server;