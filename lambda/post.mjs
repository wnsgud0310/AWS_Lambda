import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
    // 요청 본문에서 데이터 추출
    const requestJSON = JSON.parse(event.body);

    // 새로운 카드 ID 생성 (랜덤 숫자로 생성)
    const newId = Math.round(Math.random() * 10000).toString();

    // DynamoDB에 새로운 항목 추가
    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          id: newId,
          title: requestJSON.title, // 카드 제목
          category: requestJSON.category, // 카드 카테고리
        },
      })
    );

    // 응답 본문에 성공 메시지 포함
    body = `Card Added with ID ${newId}`;
  } catch (err) {
    statusCode = 400;
    body = `Error adding card: ${err.message}`;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
