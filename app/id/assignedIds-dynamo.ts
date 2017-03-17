import * as DynamoDB from "aws-sdk/clients/dynamodb";

export const assignedIdTableParams: DynamoDB.Types.CreateTableInput = {
      TableName: "AssignedIds",
      KeySchema: [
        {AttributeName: "id", KeyType: "HASH"},
        {AttributeName: "tableName", KeyType: "SORT"}
      ],
      AttributeDefinitions: [
        {AttributeName: "id", AttributeType: "S"},
        {AttributeName: "tableName", AttributeType: "S"}
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    };

