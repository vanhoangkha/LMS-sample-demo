
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

// const SOUTHEAST_REGION = "ap-southeast-1:";

export const handler = async(event) => {
  const client = new CognitoIdentityProviderClient({ });
  const userPoolId = process.env.USERPOOL_ID;
  const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    };
  const input = {
    UserPoolId: userPoolId,
  }
  
  const command = new ListUsersCommand(input);
  try {
    const response = await client.send(command);
    // console.log('response:', response);
    const users = response.Users;

    // users.forEach((user) => {
    //   user.Attributes[0].Value = SOUTHEAST_REGION + user.Attributes[0].Value
    // });

    return {
      statusCode: 200,
      body: JSON.stringify(users),
      headers
    };

  } catch(error) {
    // Handle the error
    console.log('Error:', error);
    return {
      statusCode: 500,
      body: 'An error occurred while retrieving the user list.',
      headers
    };
  }
}