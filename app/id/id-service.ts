import {Response} from 'express';
import {idManagerDb} from './idManagerDb';
import * as Prom from 'bluebird';

type IdRequestTask = {
  key: string,
  res: Response
}
export class IdService {

  protected tables: {[tableName:string]: { tasks: IdRequestTask[], active: boolean}};
  constructor() {
    this.tables = {};
  }

  generateId(key: string, res: Response): Prom<any> {
    if (!this.tables[key]) {
      this.tables[key] = { tasks: [], active: false };
    }
    const table = this.tables[key];
    const task: IdRequestTask = {key, res};
    table.tasks.push(task);
    return this.poke(key);
  }

  poke(key: string): Prom<any> {
    const table = this.tables[key];
    if (!table.active && table.tasks.length) {
      table.active = true;
      const task = table.tasks.shift();
      return idManagerDb.incrementId(task.key)
        .then( res => {
          task.res.send(res);
          table.active = false;
          return this.poke(key);
        });
    } else {
      return Prom.resolve(); // for testing
    }
  }

  getAllocatedRanges(name: string, res: Response) {
    return idManagerDb.getAllocatedRanges(name)
      .then(result => res.jsonp(result));
  }
}

export const idService: IdService = new IdService();
