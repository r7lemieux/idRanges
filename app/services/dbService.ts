// const idManagerDb = require('id/idManagerDb').instance;
import {idManagerDb} from '../id/idManagerDb';
const util = require('util');
const pg = require('pg');
const Pool = require('pg-pool');
const NativeClient = pg.native.Client;
const Prom = require('bluebird');

Prom.promisifyAll(Pool);

let pool = null;

// const connectDatabaseRaw = (knex) => {
//   const client = new pg.Client({
//     host: '127.0.0.1',
//     user: 'r7lemieux',
//     password: 'q12waq12',
//   });
//   client.query('USE increment; SELECT * FROM newTable1',
//     function (err, rows) {
//       if (err)
//         throw err;
//       console.dir(rows);
//     });
//   client.end();
//   return client;
// };

const connectDatabase = (config) => {
  console.log('=> dbService:5 ');
  const dbConfig = config.db;
  dbConfig.application_name = 'IdManager';
  dbConfig.idleTimeoutMillis = 30000;
  //dbConfig.Client = NativeClient;
  const pool = new Pool(dbConfig);
  pool.on('error', function (error, client) {
    console.log(`=> dbService:37 error ${util.inspect(error)}`)
  })
  return pool;
};

const testDatabase = (database) => {
  const res1 = database.raw('SELECT * FROM increment.newTable1')
    .then(res2 => {
      console.log(`=> dbService:26 res2 ${util.inspect(res2)}`);
      return database;
    })
    .catch(err => {
      console.log(`=> dbService:30 err ${util.inspect(err)}`)
      return database;
    });
};

const testDatabase2 = (pool) => {
  console.log(`=> dbService:54 `);
  pool.connect()
    .then(database => database.query('select * from idmanager.next_ids', [])
      .then(result => {
        database.release();
        console.log(`=> dbService:65 result.rows[0] ${util.inspect(result.rows[0])}`)
      })
      .catch(database.release)
    )
    .catch(err => console.log(`=> dbService:63 err ${util.inspect(err)}`));

};

const testDatabase3 = async(pool) => {
  console.log(`=> dbService:69`);
  const result = await pool.query('select * from idmanager.next_ids', []);
  console.log(`=> dbService:70 result.rows[0] ${util.inspect(result.rows[0])}`);
  return result.rows;
};

const createNextIdsTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS next_ids (
      name      VARCHAR(40) PRIMARY KEY,
      next_id   INT DEFAULT 1001,
      increment INT DEFAULT 1000,
      mod_time  timestamp DEFAULT current_timestamp
  );`
  )
};

const createIdRangesTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS id_ranges (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR (40),
      range_start INT,
      range_end   INT,
      create_time TIMESTAMP DEFAULT current_timestamp
    );`
  );
};

const rollback = (client, done) => {
  client.query('ROLLBACK', err => done(err));
  return Prom.reject();
};

const init = (config) => {
  pool = connectDatabase(config);
  // pool.query('CREATE SCHEMA IF NOT EXISTS idmanager AUTHORIZATION r7lemieux');
  pool.query("ALTER DATABASE kdr set search_path='idmanager'");
  idManagerDb.init(pool);
  idManagerDb.createTables();
  // testDatabase2(pool);
  // testDatabase3(pool).then(res => console.log(`=> dbService:76 res ${util.inspect(res)}`));
  // const database = connectDatabase(knex);
  // database.raw('SET search_path TO \'idmanager\';')
  //   .then(() => database)
  //   .then(testDatabase)
  //   .then(() => nextId.createTable(database))
  //   .finally(database.close);
};


exports.init = init;
exports.pool = pool;
exports.rollback = rollback;
