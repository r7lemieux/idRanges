import {Response} from 'express';
import {dynamo} from '../services/dynamoService';
import {DynamoDB} from 'aws-sdk';

type IdRequestTask = {
  key: string,
  res: Response
}
export class IdService {

  protected incrementUrl: string = 'https://kskxxtoe6c.execute-api.us-east-1.amazonaws.com/prod/incr2?counter=';
  protected tables: {[tableName:string]: { tasks: IdRequestTask[], active: boolean}};
  constructor() {
    this.tables = {};
    console.log(`=> id-service:26 this.tasks ${JSON.stringify(this.tables)}`);
  }

  generateId(key: string, res: Response): Promise<any> {
    if (!this.tables[key]) {
      this.tables[key] = { tasks: [], active: false };
    }
    const table = this.tables[key];
    console.log(`=> id-service:41 key ${key} ${table.tasks.length} tasks ` + (table.active)?'active':'');
    const task: IdRequestTask = {key, res};
    table.tasks.push(task);
    return this.poke(key);
  }

  poke(key: string): Promise<any> {
    const table = this.tables[key];
    if (!table.active && table.tasks.length) {
      table.active = true;
      const task = table.tasks.shift();
      console.log(`=> id-service:48 task ${(task)}`);
      return this.increment(task.key)
        .then((nextId: number) => {
          console.log(`=> id-service:50 nextId ${JSON.stringify(nextId)}`);
          task.res.send({nextId: nextId});
          table.active = false;
          return this.poke(key);
        });
    } else {
      return Promise.resolve(); // for testing
    }
  }

  increment(key: string): Promise<number> {
    let val: number = 0;
    console.log(`=> id-service:66 key ${JSON.stringify(key)}`);
    return dynamo.getItem({
      TableName: 'NextIds',
      Key: {key: {S: key}}
    }).promise()
      .then((getRes: DynamoDB.Types.GetItemOutput) => {
          console.log(`=> id-service:68 getRes ${JSON.stringify(getRes)}`);
          if (!getRes.Item) {
            console.log(`=> id-service:70 no key found`);
            return dynamo.putItem({
              TableName: 'NextIds',
              Item: {
                key: {S: key},
                val: {N: '1'}
              }
            }).promise()
              .then((putRes: DynamoDB.Types.PutItemOutput) => {
                return 1;
              })
          } else {
            val = Number(getRes.Item['val'].N);
            console.log('=> id-service:83 found entry val ' + val + ' res ' + JSON.stringify(getRes));
            return dynamo.updateItem({
              TableName: 'NextIds',
              Key: {key: {S: key}},
              UpdateExpression: 'SET val = :v',
              ExpressionAttributeValues: {':v': {N: '' + (1 + val)}}
            }).promise()
              .then((updateRes: DynamoDB.Types.UpdateItemOutput) => {
                return val + 1;
              });
          }
        },
        (err) => {
          console.log(`=> id-service:96 err ${JSON.stringify(err)}`);
        }
      )
      .catch(err => console.log(`=> id-service:99 err ${JSON.stringify(err)}`));
  }

}

export const idService: IdService = new IdService();
