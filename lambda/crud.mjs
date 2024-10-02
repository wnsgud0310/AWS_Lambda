import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// DynamoDB 설정
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "kanban-table-park";

export const handler = async (event) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const { routeKey, pathParameters, body: requestBody } = event;

    switch (routeKey) {
      case "DELETE /cards/{id}":
        // 카드 삭제
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: pathParameters.id, // 경로에서 ID 추출
            },
          })
        );
        body = `Deleted card ${pathParameters.id}`;
        break;

      case "GET /cards/{id}":
        // 특정 카드 가져오기
        const getItem = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: pathParameters.id, // 경로에서 ID 추출
            },
          })
        );
        body = getItem.Item || `Card ${pathParameters.id} not found`;
        break;

      case "GET /cards":
        // 모든 카드 가져오기
        const scanItems = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = scanItems.Items || [];
        break;

      case "POST /cards":
        // 카드 추가
        const requestJSON = JSON.parse(requestBody);
        const newId = Math.round(Math.random() * 10000).toString();
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: newId,
              title: requestJSON.title,
              category: requestJSON.category,
            },
          })
        );
        body = `Card Added ${newId}`;
        break;

      case "PATCH /cards/{id}":
        // 카드 수정 (일부 필드만 업데이트)
        const patchRequestJSON = JSON.parse(requestBody);
        const updateParams = {
          TableName: tableName,
          Key: { id: pathParameters.id },
          UpdateExpression: "set #title = :title, #category = :category",
          ExpressionAttributeNames: {
            "#title": "title",
            "#category": "category",
          },
          ExpressionAttributeValues: {
            ":title": patchRequestJSON.title,
            ":category": patchRequestJSON.category,
          },
          ReturnValues: "UPDATED_NEW",
        };

        const updatedItem = await dynamo.send(new UpdateCommand(updateParams));
        body = `Card Updated: ${JSON.stringify(updatedItem.Attributes)}`;
        break;

      case "PUT /cards/{id}":
        // 카드 전체 업데이트 (항목을 덮어쓰기)
        const putRequestJSON = JSON.parse(requestBody);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: pathParameters.id, // 경로에서 받은 id
              title: putRequestJSON.title,
              category: putRequestJSON.category,
            },
          })
        );
        body = `Card Updated ${pathParameters.id}`;
        break;

      default:
        throw new Error(`Unsupported route: "${routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
