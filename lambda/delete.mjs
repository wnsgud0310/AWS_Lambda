import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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
    const { id } = event.pathParameters; // 경로에서 ID 추출

    // 카드 삭제 명령 실행
    await dynamo.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id }, // 삭제할 카드의 ID
      })
    );

    // 삭제 성공 메시지
    body = `Card with ID ${id} deleted successfully.`;
  } catch (err) {
    statusCode = 400;
    body = `Error deleting card: ${err.message}`;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
