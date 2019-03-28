const Server = require('./modules/http/server');

class MyServer {
    constructor() {
        this.server = new Server();
    }

    start() {
        return new Promise((resolve, reject) => {
            this.server.bindHeaders();
            this.server.listen();
        })
    }
}

module.exports = MyServer;