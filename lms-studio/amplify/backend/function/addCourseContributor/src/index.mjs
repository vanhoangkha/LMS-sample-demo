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
let contributorTable = "Contributor";
if (process.env.ENV && process.env.ENV !== "NONE") {
  courseTable = courseTable + "-" + process.env.ENV;
  contributorTable = contributorTable + "-" + process.env.ENV;
}

export const handler = async (event) => {
  let scanParams = {
    TableName: courseTable,
  };
  let countViewData = [];
  try {
    let scanCommand = new ScanCommand(scanParams);
    const data = await docClient.send(scanCommand);
    // separate follow by Creator 
    const groupedData = data.Items.reduce((acc, item) => {
      const groupKey = item.CreatorID;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});

    // count views
    if (groupedData) {
      for (const item in groupedData) {
        let countViews = 0;
        groupedData[item].map((course) => {
          countViews += course.Views;
        });
        countViewData.push({
          PutRequest: {
            Item: {
              contributorID: item,
              views: countViews,
              coursesNum: groupedData[item].length,
            },
          },
        });
      }
    }
    console.log(countViewData);
    let putCommand = new BatchWriteCommand({
      RequestItems: {
        [contributorTable]: countViewData,
      },
    });
    await docClient.send(putCommand);
  } catch (error) {
    console.log("Error:", error);
  }
};
