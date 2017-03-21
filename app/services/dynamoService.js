"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const BPromise = require("bluebird");
const _ = require('lodash');
const nextIds_dynamo_1 = require("../id/nextIds-dynamo");
const tablesParams = [nextIds_dynamo_1.nextIdsTableParams];
let tableNameList;
function initDynamo() {
    const updateParams = {
        region: 'us-east-1',
        endpoint: 'http://localhost:8000'
    };
    aws_sdk_1.config.update(updateParams);
    aws_sdk_1.config.setPromisesDependency(BPromise);
    exports.dynamo = new aws_sdk_1.DynamoDB();
    return exports.dynamo.listTables().promise()
        .then((res) => {
        tableNameList = res.TableNames;
        console.log(`=> dynamo:23 tableNameList ${JSON.stringify(tableNameList)}`);
        tablesParams.forEach(tableParams => {
            return exports.createTable(tableParams);
        });
    });
}
exports.initDynamo = initDynamo;
exports.createTable = (params) => {
    console.log(`=> dynamo:46 TableName ${JSON.stringify(params.TableName)}`);
    if (_.includes(tableNameList, params.TableName)) {
        return Promise.resolve();
    }
    return exports.dynamo.createTable(params).promise()
        .then((data) => console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2)))
        .catch((err) => console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)));
};
//# sourceMappingURL=dynamoService.js.map