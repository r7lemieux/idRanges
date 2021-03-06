import {idManagerDb} from '../id/idManagerDb';
const util = require('util');
const pg = require('pg').native;
const Prom = require('bluebird');

Prom.promisifyAll(pg.Pool);

let pool = null;

const connectDatabase = (config) => {
  const dbConfig = config.db;
  dbConfig.application_name = 'IdManager';
  dbConfig.idleTimeoutMillis = 30000;
  const pool = new pg.Pool(dbConfig);
  pool.on('error', function (error, client) {
    console.log(`=> dbService:37 error ${util.inspect(error)}`)
  })
  return pool;
};

const init = (config) => {
  pool = connectDatabase(config);
  pool.query("SET search_path TO 'idmanager'");
  idManagerDb.init(pool);
  idManagerDb.createTables();
};


exports.init = init;
exports.pool = pool;
