import {Response} from 'express';
import {idManagerDb} from './idManagerDb';
import * as Prom from 'bluebird';

type IdRequestTask = {
  key: string,
  res: Response
}
export class IdService {

  protected incrementUrl: string = 'https://kskxxtoe6c.execute-api.us-east-1.amazonaws.com/prod/incr2?counter=';
  protected tables: {[tableName:string]: { tasks: IdRequestTask[], active: boolean}};
  constructor() {
    this.tables = {};
    console.log(`=> id-service:15 this.tasks ${JSON.stringify(this.tables)}`);
  }

  generateId(key: string, res: Response): Prom<any> {
    if (!this.tables[key]) {
      this.tables[key] = { tasks: [], active: false };
    }
    const table = this.tables[key];
    console.log(`=> id-service:23 key ${key} ${table.tasks.length} tasks ` + (table.active)?'active':'');
    const task: IdRequestTask = {key, res};
    table.tasks.push(task);
    return this.poke(key);
  }

  poke(key: string): Prom<any> {
    const table = this.tables[key];
    if (!table.active && table.tasks.length) {
      table.active = true;
      const task = table.tasks.shift();
      console.log(`=> id-service:34 task ${(task)}`);
      return this.increment(task.key)
        .then( res => {
          console.log(`=> id-service:37  nextId ${JSON.stringify(res)}`);
          task.res.send(res);
          table.active = false;
          return this.poke(key);
        });
    } else {
      return Prom.resolve(); // for testing
    }
  }

  increment(key: string): Prom<any> {
    let val: number = 0;
    console.log(`=> id-service:49 key ${JSON.stringify(key)}`);
    return idManagerDb.incrementId(key);
  }

  getAllocatedRanges(name: string, res: Response) {
    return idManagerDb.getAllocatedRanges(name)
      .then(result => res.jsonp(result));
  }
}

export const idService: IdService = new IdService();
