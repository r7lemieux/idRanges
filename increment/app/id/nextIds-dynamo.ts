import * as DynamoDB from "aws-sdk/clients/dynamodb";

export const nextIdsTableParams: DynamoDB.Types.CreateTableInput = {
      TableName: "NextIds",
      KeySchema: [
        {AttributeName: "key", KeyType: "HASH"},  //Partition key
      ],
      AttributeDefinitions: [
        {AttributeName: "key", AttributeType: "S"}
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    };

