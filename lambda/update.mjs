import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommand,
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
    const { routeKey, pathParameters } = event;
    const { id } = pathParameters; // 경로에서 ID 추출
    const requestBody = JSON.parse(event.body); // 요청 본문에서 업데이트할 데이터를 파싱

    if (routeKey === "PATCH /cards/{id}") {
      // 카드의 일부 필드 업데이트 (title, category)
      const updateParams = {
        TableName: tableName,
        Key: { id }, // 업데이트할 카드의 ID
        UpdateExpression: "set #title = :title, #category = :category",
        ExpressionAttributeNames: {
          "#title": "title",
          "#category": "category",
        },
        ExpressionAttributeValues: {
          ":title": requestBody.title,
          ":category": requestBody.category,
        },
        ReturnValues: "UPDATED_NEW", // 업데이트된 내용을 반환
      };

      // 카드 업데이트 실행
      const updatedItem = await dynamo.send(new UpdateCommand(updateParams));
      body = `Card Updated: ${JSON.stringify(updatedItem.Attributes)}`;
    } else if (routeKey === "PUT /cards/{id}") {
      // 카드 전체 덮어쓰기
      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            id, // 경로에서 받은 id 값으로 설정
            title: requestBody.title, // 본문에서 받은 title 값으로 설정
            category: requestBody.category, // 본문에서 받은 category 값으로 설정
          },
        })
      );
      body = `Card with ID ${id} was updated successfully.`;
    } else {
      statusCode = 400;
      body = `Unsupported route: "${routeKey}"`;
    }
  } catch (err) {
    statusCode = 400;
    body = `Error processing card: ${err.message}`;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
