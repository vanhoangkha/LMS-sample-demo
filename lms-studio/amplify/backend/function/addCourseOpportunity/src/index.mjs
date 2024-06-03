import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// const SOUTHEAST_REGION = "ap-southeast-1:";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let courseTable = "courses";
let accessCodeTable = "AccessCode";
let courseOppTable = "CourseOpportunity";
if (process.env.ENV && process.env.ENV !== "NONE") {
  courseTable = courseTable + "-" + process.env.ENV;
  accessCodeTable = accessCodeTable + "-" + process.env.ENV;
  courseOppTable = courseOppTable + "-" + process.env.ENV;
}

export const handler = async (event) => {
  let scanParams = {
    TableName: courseTable,
  };
  try {
    let scanCommand = new ScanCommand(scanParams);
    const data = await docClient.send(scanCommand);
    const courseOppValue = data.Items.map((item) => {
      let value = 0;
      for (const assCode of item.AccessCode) {
        // docClient.send(
        //   new GetCommand({
        //     TableName: accessCodeTable,
        //     Key: assCode,
        //   }).then((data) => {
        //     return {
        //       PutRequest: {
        //         Item: {
        //           CourseID: item.ID,
        //           Value: data.Value,
        //         },
        //       },
        //     };
        //   })
        // );
        const valueCode = assCode.split("-")[1];
        if(valueCode){
          value += parseInt(Buffer.from(valueCode, 'base64'));
        }
      }
      return {
        PutRequest: {
          Item: {
            CourseID: item.ID,
            CourseName: item.Name,
            OppValue: value,
          },
        },
      };
    });
    // console.log(courseOppValue)
    
    if (courseOppValue) {
      let putCommand = new BatchWriteCommand({
        RequestItems: {
          [courseOppTable]: courseOppValue,
        },
      });
      await docClient.send(putCommand);
    }
  } catch (error) {
    console.log("Error:", error);
  }
};
