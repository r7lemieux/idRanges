"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idManagerDb_1 = require("./idManagerDb");
const Prom = require("bluebird");
class IdService {
    constructor() {
        this.tables = {};
    }
    generateId(key, res) {
        if (!this.tables[key]) {
            this.tables[key] = { tasks: [], active: false };
        }
        const table = this.tables[key];
        const task = { key, res };
        table.tasks.push(task);
        return this.poke(key);
    }
    poke(key) {
        const table = this.tables[key];
        if (!table.active && table.tasks.length) {
            table.active = true;
            const task = table.tasks.shift();
            return idManagerDb_1.idManagerDb.incrementId(task.key)
                .then(res => {
                task.res.send(res);
                table.active = false;
                return this.poke(key);
            });
        }
        else {
            return Prom.resolve();
        }
    }
    getAllocatedRanges(name, res) {
        return idManagerDb_1.idManagerDb.getAllocatedRanges(name)
            .then(result => res.jsonp(result));
    }
}
exports.IdService = IdService;
exports.idService = new IdService();
//# sourceMappingURL=id-service.js.map