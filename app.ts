"use strict";
require('app-module-path').addPath(__dirname + '/app');
import {idRoutes} from 'id/id-routes';
import fs = require('fs');

const db = require('services/dbService');
const express = require('express');
const knex = require('knex');
const app = express();

let env = 'dev';
const args = process.argv.slice(2)
if (args.length && args[0] === 'prod') {
  env = args[0];
}
const envFile = fs.readFileSync(`config/${env}.json`);
const config = JSON.parse(envFile.toString())
const port = config.server.port;

app.get('/', function (req, res) {
  res.send('Hello Stranger!');
});

console.log(`Running with env: ${env} `);
idRoutes(app);

db.init(config, knex);

app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
