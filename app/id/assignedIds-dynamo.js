"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignedIdTableParams = {
    TableName: "AssignedIds",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
        { AttributeName: "tableName", KeyType: "SORT" }
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "tableName", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
//# sourceMappingURL=assignedIds-dynamo.js.map