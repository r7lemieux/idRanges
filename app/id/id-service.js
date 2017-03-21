"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idManagerDb_1 = require("./idManagerDb");
const Prom = require("bluebird");
class IdService {
    constructor() {
        this.incrementUrl = 'https://kskxxtoe6c.execute-api.us-east-1.amazonaws.com/prod/incr2?counter=';
        this.tables = {};
        console.log(`=> id-service:15 this.tasks ${JSON.stringify(this.tables)}`);
    }
    generateId(key, res) {
        if (!this.tables[key]) {
            this.tables[key] = { tasks: [], active: false };
        }
        const table = this.tables[key];
        console.log(`=> id-service:23 key ${key} ${table.tasks.length} tasks ` + (table.active) ? 'active' : '');
        const task = { key, res };
        table.tasks.push(task);
        return this.poke(key);
    }
    poke(key) {
        const table = this.tables[key];
        if (!table.active && table.tasks.length) {
            table.active = true;
            const task = table.tasks.shift();
            console.log(`=> id-service:34 task ${(task)}`);
            return this.increment(task.key)
                .then(res => {
                console.log(`=> id-service:37  nextId ${JSON.stringify(res)}`);
                task.res.send(res);
                table.active = false;
                return this.poke(key);
            });
        }
        else {
            return Prom.resolve();
        }
    }
    increment(key) {
        let val = 0;
        console.log(`=> id-service:49 key ${JSON.stringify(key)}`);
        return idManagerDb_1.idManagerDb.incrementId(key);
    }
    getAllocatedRanges(name, res) {
        return idManagerDb_1.idManagerDb.getAllocatedRanges(name)
            .then(result => res.jsonp(result));
    }
}
exports.IdService = IdService;
exports.idService = new IdService();
//# sourceMappingURL=id-service.js.map