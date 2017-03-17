import * as AWS from 'aws-sdk';
import {DynamoDB, config} from "aws-sdk";
import * as BPromise from 'bluebird';
const _ = require('lodash');
import {nextIdsTableParams} from '../id/nextIds-dynamo';

const tablesParams: DynamoDB.Types.CreateTableInput[] = [nextIdsTableParams];

declare type tableParams = DynamoDB.Types.CreateTableInput;

export let dynamo: AWS.DynamoDB;

let tableNameList: string[];

export function initDynamo() {

  const updateParams = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
  config.update(updateParams);
  config.setPromisesDependency(BPromise);

  dynamo = new DynamoDB();
  return dynamo.listTables().promise()
    .then((res: DynamoDB.Types.ListTablesOutput) => {
      tableNameList = res.TableNames;
      console.log(`=> dynamo:23 tableNameList ${JSON.stringify(tableNameList)}`);
      tablesParams.forEach( tableParams => {
        return createTable(tableParams);
      });
    });
}

// const nextIdTableParams: tableParams = {
//   TableName: "NextIds",
//   KeySchema: [
//     {AttributeName: "key", KeyType: "HASH"},  //Partition key
//   ],
//   AttributeDefinitions: [
//     {AttributeName: "key", AttributeType: "S"}
//   ],
//   ProvisionedThroughput: {
//     ReadCapacityUnits: 10,
//     WriteCapacityUnits: 10
//   }
// };

export const createTable = (params: tableParams): Promise<void> => {
  console.log(`=> dynamo:46 TableName ${JSON.stringify(params.TableName)}`);
  if (_.includes(tableNameList, params.TableName)) {
    return Promise.resolve();
  }
  return dynamo.createTable(params).promise()
    .then((data: DynamoDB.Types.CreateTableOutput) => console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2)))
    .catch((err: Error) => console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)));
}
