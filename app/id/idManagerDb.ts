import * as util from 'util';
import * as Prom from 'bluebird';

export class IdManagerDb {

  protected pool;

  constructor() {
  }

  public init(pool) {
    this.pool = pool;
  }

  public createTables() {
    this.createNextIdsTable();
    this.createIdRangesTable();
  }

  createNextIdsTable() {
    this.pool.query(`CREATE TABLE IF NOT EXISTS next_ids (
      name      VARCHAR(40) PRIMARY KEY,
      next_id   INT DEFAULT 1001,
      increment INT DEFAULT 1000,
      mod_time  timestamp DEFAULT current_timestamp
  );`);
  }

  createIdRangesTable() {
    this.pool.query(`CREATE TABLE IF NOT EXISTS id_ranges (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR (40),
      range_start INT,
      range_end   INT,
      create_time TIMESTAMP DEFAULT current_timestamp
    );`);
  }

  protected getIncrementSql(name: string, increment: number): string {
    var a1 = `IF EXISTS (SELECT * FROM next_ids WHERE name = '${name}') THEN
              UPDATE next_ids 
              SET next_id = (c.next_id + c.increment) 
              FROM (
                SELECT next_id, increment 
                  FROM next_ids 
                  WHERE name = '${name}') AS c 
              WHERE name = '${name}';
                
            INSERT INTO id_ranges (name, range_start, range_end) 
                SELECT name, next_id, next_id + increment 
                FROM next_ids 
                WHERE name = '${name}';   
         
            SELECT next_id, increment FROM next_ids 
              WHERE name = '${name}'
                
          ELSE
          
            INSERT INTO next_ids (name, next_id) 
              VALUES ('${name}', 1001);
                
            INSERT INTO id_ranges (name, range_start, range_end) 
              VALUES ( '${name}', 1, 1000 );
                  
            SELECT * FROM next_ids WHERE name = '${name}';
            
          ENDIF
          `;

    var a2 = `IF EXISTS (SELECT * FROM next_ids WHERE name = '${name}') THEN SELECT * FROM next_ids WHERE name = '${name}' ENFDIF`;

    var a3 = `
    $insert = "INSERT INTO next_ids (name, next_id) SELECT ('${name}, 1001)";
    $upsert = "UPDATE next_ids SET next_id=next_id+1000 WHERE name='${name}'";
    WITH upsert AS ($upsert RETURNING *) $insert WHERE NOT EXISTS (SELECT * FROM upsert);
    `;

    const a4 = `
    WITH upsert AS (UPDATE next_ids SET next_id=next_id+increment WHERE name='${name}' RETURNING *)
    INSERT INTO next_ids (name, next_id, increment) SELECT '${name}', ${increment} + 1, ${increment} WHERE NOT EXISTS (SELECT * FROM upsert) 
    RETURNING *;
    `;

    const a5 = `
       INSERT INTO next_ids (name, next_id, increment)
       VALUES ('${name}', ${increment} + 1, ${increment})
       ON CONFLICT (name) DO UPDATE SET next_id = next_ids.next_id + next_ids.increment;
        
      INSERT INTO id_ranges (name, range_start, range_end) 
        SELECT name, next_id - increment -1, next_id - 1
          FROM next_ids 
          WHERE name = '${name}'
          RETURNING range_start, range_end; 

    `;
    return a5;
  }


  public incrementId(name: string): Prom<any> {
    let client = null;
    let result = null;
    return this.pool.connect()
      .then( newClient => {
        client = newClient;
        return client.query('BEGIN');
      })
      .then(() => {
        const sql = this.getIncrementSql(name, 500);
        return client.query(sql, []);
      })
      .then( newResult => {
        result = newResult;
        client.query('COMMIT');
      })
      .then(() => {
        if (!result.rows || !result.rows[0]) {
          return client.query('ROLLBACK', client.release);
        }
        client.release();
        const row = result.rows[0];
        return {from: row.range_start, to: row.range_end};
      })
      .catch( () => {
        return client.query('ROLLBACK', client.release);
      });

  }

  getAllocatedRanges(name): any {
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
      .catch(() => this.releaseClient(client))
  }

  protected releaseClient(client) {
    if (client) {
      client.release();
    }
  }

  protected rollback(client, done) {
    return client.query('ROLLBACK');
  }
}

export const idManagerDb: IdManagerDb = new IdManagerDb();
