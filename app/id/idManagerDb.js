"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
class IdManagerDb {
    constructor() {
    }
    init(pool) {
        this.pool = pool;
    }
    createTables() {
        let client = null;
        return this.pool.connect()
            .then(newClient => {
            client = newClient;
            return this.createNextIdsTable(client);
        })
            .then((ret) => {
            console.log(`=> idManagerDb:23 ret ${util.inspect(ret)}`);
            this.createIdRangesTable(client);
        })
            .catch((err) => {
            console.log(`err => Fail to create Tables ${util.inspect(err)}`);
        });
    }
    createNextIdsTable(client) {
        client.query(`CREATE TABLE IF NOT EXISTS next_ids (
      name      VARCHAR(40) PRIMARY KEY,
      next_id   INT DEFAULT 1001,
      increment INT DEFAULT 1000,
      mod_time  timestamp DEFAULT current_timestamp
  );`);
    }
    createIdRangesTable(client) {
        client.query(`CREATE TABLE IF NOT EXISTS id_ranges (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR (40),
      range_start INT,
      range_end   INT,
      create_time TIMESTAMP DEFAULT current_timestamp
    );`);
    }
    getIncrementSql(name, increment) {
        return `
       INSERT INTO next_ids (name, next_id, increment)
       VALUES ('${name}', ${increment} + 1, ${increment})
       ON CONFLICT (name) DO UPDATE SET next_id = next_ids.next_id + next_ids.increment;
        
      INSERT INTO id_ranges (name, range_start, range_end) 
        SELECT name, next_id - increment -1, next_id - 1
          FROM next_ids 
          WHERE name = '${name}'
          RETURNING range_start, range_end; 

    `;
    }
    incrementId(name) {
        let client = null;
        let result = null;
        return this.pool.connect()
            .then(newClient => {
            client = newClient;
            return client.query('BEGIN');
        })
            .then(() => {
            const sql = this.getIncrementSql(name, 500);
            return client.query(sql);
        })
            .then(newResult => {
            result = newResult;
            client.query('COMMIT');
        })
            .then(() => {
            console.log(`=> idManagerDb:83 res ${util.inspect(result)}`);
            if (!result.rows || !result.rows[0]) {
                return client.query('ROLLBACK', client.release);
            }
            client.release();
            const row = result.rows[0];
            return { from: row.range_start, to: row.range_end };
        })
            .catch((err) => {
            console.log(`=> idManagerDb:92 res ${util.inspect(err)}`);
            return client.query('ROLLBACK', client.release);
        });
    }
    getAllocatedRanges(name) {
        let client = null;
        return this.pool.connect()
            .then(newClient => {
            client = newClient;
            return client.query(`SELECT range_start, range_end from idmanager.id_ranges WHERE name = '${name}'`);
        })
            .then(result => {
            client.release();
            return (result.rows.map(row => [row.range_start, row.range_end]));
        })
            .catch(() => this.releaseClient(client));
    }
    releaseClient(client) {
        if (client) {
            client.release();
        }
    }
    rollback(client, done) {
        return client.query('ROLLBACK');
    }
}
exports.IdManagerDb = IdManagerDb;
exports.idManagerDb = new IdManagerDb();
//# sourceMappingURL=idManagerDb.js.map