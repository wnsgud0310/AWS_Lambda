import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
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
    // routeKey를 통해 어떤 경로로 요청이 들어왔는지 확인
    const { routeKey, pathParameters } = event;

    if (routeKey === "GET /cards/{id}") {
      // 특정 ID로 카드 가져오기
      const { id } = pathParameters; // 경로에서 ID 추출
      const getItem = await dynamo.send(
        new GetCommand({
          TableName: tableName,
          Key: { id }, // ID로 항목 검색
        })
      );

      // 가져온 항목이 없을 경우
      if (!getItem.Item) {
        body = `Card with ID ${id} not found`;
        statusCode = 404;
      } else {
        body = getItem.Item; // 카드 정보 반환
      }
    } else if (routeKey === "GET /cards") {
      // 모든 카드 가져오기
      const scanResult = await dynamo.send(
        new ScanCommand({
          TableName: tableName,
        })
      );

      body = scanResult.Items || []; // 카드 목록 반환
    } else {
      statusCode = 404;
      body = `Unsupported route: "${routeKey}"`;
    }
  } catch (err) {
    statusCode = 400;
    body = `Error retrieving cards: ${err.message}`;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
};
