"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const idManagerDb_1 = require("../id/idManagerDb");
const util = require('util');
const pg = require('pg');
const Pool = require('pg-pool');
const NativeClient = pg.native.Client;
const Prom = require('bluebird');
Prom.promisifyAll(Pool);
let pool = null;
const connectDatabase = (config) => {
    console.log('=> dbService:5 ');
    const dbConfig = config.db;
    dbConfig.application_name = 'IdManager';
    dbConfig.idleTimeoutMillis = 30000;
    const pool = new Pool(dbConfig);
    pool.on('error', function (error, client) {
        console.log(`=> dbService:37 error ${util.inspect(error)}`);
    });
    return pool;
};
const testDatabase = (database) => {
    const res1 = database.raw('SELECT * FROM increment.newTable1')
        .then(res2 => {
        console.log(`=> dbService:26 res2 ${util.inspect(res2)}`);
        return database;
    })
        .catch(err => {
        console.log(`=> dbService:30 err ${util.inspect(err)}`);
        return database;
    });
};
const testDatabase2 = (pool) => {
    console.log(`=> dbService:54 `);
    pool.connect()
        .then(database => database.query('select * from idmanager.next_ids', [])
        .then(result => {
        database.release();
        console.log(`=> dbService:65 result.rows[0] ${util.inspect(result.rows[0])}`);
    })
        .catch(database.release))
        .catch(err => console.log(`=> dbService:63 err ${util.inspect(err)}`));
};
const testDatabase3 = (pool) => __awaiter(this, void 0, void 0, function* () {
    console.log(`=> dbService:69`);
    const result = yield pool.query('select * from idmanager.next_ids', []);
    console.log(`=> dbService:70 result.rows[0] ${util.inspect(result.rows[0])}`);
    return result.rows;
});
const createNextIdsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS next_ids (
      name      VARCHAR(40) PRIMARY KEY,
      next_id   INT DEFAULT 1001,
      increment INT DEFAULT 1000,
      mod_time  timestamp DEFAULT current_timestamp
  );`);
};
const createIdRangesTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS id_ranges (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR (40),
      range_start INT,
      range_end   INT,
      create_time TIMESTAMP DEFAULT current_timestamp
    );`);
};
const rollback = (client, done) => {
    client.query('ROLLBACK', err => done(err));
    return Prom.reject();
};
const init = (config) => {
    pool = connectDatabase(config);
    pool.query("SET search_path TO 'idmanager'");
    idManagerDb_1.idManagerDb.init(pool);
    idManagerDb_1.idManagerDb.createTables();
};
exports.init = init;
exports.pool = pool;
exports.rollback = rollback;
//# sourceMappingURL=dbService.js.map