import { APIGatewayProxyEvent } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent) {
  try {
    if (!event.body) {
      throw {
        code: 400,
        message: "BodyNotProvided",
      };
    }
    const rawBody = JSON.parse(event.body);
    if (!rawBody) {
      throw {
        code: 400,
        message: "InputNotProvided",
      };
    }

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: error.code,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
}
