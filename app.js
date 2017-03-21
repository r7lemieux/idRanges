"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('app-module-path').addPath(__dirname + '/app');
const id_routes_1 = require("id/id-routes");
const fs = require("fs");
const db = require('services/dbService');
const express = require('express');
const knex = require('knex');
const app = express();
let env = 'dev';
const args = process.argv.slice(2);
if (args.length && args[0] === 'prod') {
    env = args[0];
}
const envFile = fs.readFileSync(`config/${env}.json`);
const config = JSON.parse(envFile.toString());
const port = config.server.port;
app.get('/', function (req, res) {
    res.send('Hello Stranger!');
});
console.log(`Running with env: ${env} `);
id_routes_1.idRoutes(app);
db.init(config, knex);
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//# sourceMappingURL=app.js.map