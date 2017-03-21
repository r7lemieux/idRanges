"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextIdsTableParams = {
    TableName: "NextIds",
    KeySchema: [
        { AttributeName: "key", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
        { AttributeName: "key", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
//# sourceMappingURL=nextIds-dynamo.js.map