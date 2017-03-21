"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoService_1 = require("../services/dynamoService");
class IdService {
    constructor() {
        this.incrementUrl = 'https://kskxxtoe6c.execute-api.us-east-1.amazonaws.com/prod/incr2?counter=';
        this.tables = {};
        console.log(`=> id-service:26 this.tasks ${JSON.stringify(this.tables)}`);
    }
    generateId(key, res) {
        if (!this.tables[key]) {
            this.tables[key] = { tasks: [], active: false };
        }
        const table = this.tables[key];
        console.log(`=> id-service:41 key ${key} ${table.tasks.length} tasks ` + (table.active) ? 'active' : '');
        const task = { key, res };
        table.tasks.push(task);
        return this.poke(key);
    }
    poke(key) {
        const table = this.tables[key];
        if (!table.active && table.tasks.length) {
            table.active = true;
            const task = table.tasks.shift();
            console.log(`=> id-service:48 task ${(task)}`);
            return this.increment(task.key)
                .then((nextId) => {
                console.log(`=> id-service:50 nextId ${JSON.stringify(nextId)}`);
                task.res.send({ nextId: nextId });
                table.active = false;
                return this.poke(key);
            });
        }
        else {
            return Promise.resolve();
        }
    }
    increment(key) {
        let val = 0;
        console.log(`=> id-service:66 key ${JSON.stringify(key)}`);
        return dynamoService_1.dynamo.getItem({
            TableName: 'NextIds',
            Key: { key: { S: key } }
        }).promise()
            .then((getRes) => {
            console.log(`=> id-service:68 getRes ${JSON.stringify(getRes)}`);
            if (!getRes.Item) {
                console.log(`=> id-service:70 no key found`);
                return dynamoService_1.dynamo.putItem({
                    TableName: 'NextIds',
                    Item: {
                        key: { S: key },
                        val: { N: '1' }
                    }
                }).promise()
                    .then((putRes) => {
                    return 1;
                });
            }
            else {
                val = Number(getRes.Item['val'].N);
                console.log('=> id-service:83 found entry val ' + val + ' res ' + JSON.stringify(getRes));
                return dynamoService_1.dynamo.updateItem({
                    TableName: 'NextIds',
                    Key: { key: { S: key } },
                    UpdateExpression: 'SET val = :v',
                    ExpressionAttributeValues: { ':v': { N: '' + (1 + val) } }
                }).promise()
                    .then((updateRes) => {
                    return val + 1;
                });
            }
        }, (err) => {
            console.log(`=> id-service:96 err ${JSON.stringify(err)}`);
        })
            .catch(err => console.log(`=> id-service:99 err ${JSON.stringify(err)}`));
    }
}
exports.IdService = IdService;
exports.idService = new IdService();
//# sourceMappingURL=dynamoId-service.js.map