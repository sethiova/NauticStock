const db = require('../classes/db');

class Model extends db {
    constructor() {
        super();
        this.table = this.constructor.name.toLowerCase(); 
    }

    getTableName() {
        return this.table;
    }
}

module.exports = Model;
