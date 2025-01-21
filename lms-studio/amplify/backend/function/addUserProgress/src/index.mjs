import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  GetCommand,
  ScanCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// const SOUTHEAST_REGION = "ap-southeast-1:";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let userProgressTable = "UserProgress";
let userCourseTable = "UserCourse";
let userLectureTable = "UserLecture";
let usersTable = "Users";
let courseTable = "courses";

if (process.env.ENV && process.env.ENV !== "NONE") {
  userProgressTable = userProgressTable + "-" + process.env.ENV;
  userCourseTable = userCourseTable + "-" + process.env.ENV;
  userLectureTable = userLectureTable + "-" + process.env.ENV;
  usersTable = usersTable + "-" + process.env.ENV;
  courseTable = courseTable + "-" + process.env.ENV;
}

let userCourseProgress = [];

const getUserCourseList = async () => {
  let userCourseScan = {
    TableName: userCourseTable,
  };

  let scanCommand = new ScanCommand(userCourseScan);
  const response = await docClient.send(scanCommand);
  return response.Items;
};

const countProgress = async (course, userid) => {
  let countLecture = 0;
  // console.log("course", course);
  for (var j = 0; j < course.Chapters.length; j++) {
    for (var i = 0; i < course.Chapters[j].lectures.length; i++) {
      const item = course.Chapters[j].lectures[i];
      // console.log("lectureId", item.lectureId);
      const queryInput = {
        TableName: userLectureTable,
        KeyConditions: {
          UserID: {
            ComparisonOperator: "EQ",
            AttributeValueList: [userid],
          },
          LectureID: {
            ComparisonOperator: "EQ",
            AttributeValueList: [item.lectureId],
          },
        }
      };
      let userLectureQuery = new QueryCommand(queryInput);

      let userLecture = await docClient.send(userLectureQuery);
      console.log("userLecture", userLecture);
      if (userLecture.Items) {
        countLecture += 1;
      }
    }
  }
  return countLecture;
};

const putDataToDB = async (userCourseProgress) => {
  for (var i = 0; i < userCourseProgress.length; i++) {
    const item = userCourseProgress[i];
    let putItemParams = {
      TableName: userProgressTable,
      Item: item,
    };
    try {
      let command = new PutCommand(putItemParams);
      await docClient.send(command);
    } catch (error) {
      // console.log("Error:", error);
    }
  }
};

const getIdentity = async (userId) => {
  const getInputParam = {
    TableName: usersTable,
    Key: {
      UserID: userId
    }
  }
  let command = new GetCommand(getInputParam);
  let response = await docClient.send(command);
  return response.Item ? response.Item.Identity : null;
}

const calProgress = async () => {
  // console.log("calProgress");
  let userCourseList, course;

  try {
    userCourseList = await getUserCourseList();
    // console.log("userCourseList", userCourseList);

    let currentUser = userCourseList[0].UserID;
    let currentIdentity = await getIdentity(currentUser)
    let nextUser,
      data = {
        UserID: currentUser,
        Progress: [],
      },
      i = 0;
    console.log("userCourseList.length", userCourseList.length)
    for (i; i < userCourseList.length; i++) {
      let item = userCourseList[i];
      nextUser = item.UserID;
      // console.log("currentIdentity", currentIdentity)
      if (currentUser == nextUser && !currentIdentity) {
        continue;
      }
      if (currentUser !== nextUser) {
        //push data
        if (data.Progress.length > 0){
          userCourseProgress.push(data);
        }
        // console.log("userCourseProgress", userCourseProgress);
        // init data
        // summurypercent = 0;
        data = {
          UserID: nextUser,
          Progress: [],
          // ProgressDate: new Date().toISOString(),
        };
        currentUser = nextUser;
        currentIdentity = await getIdentity(currentUser)
        if (!currentIdentity) {
          continue;
        }
      }

      let courseQuery = {
        TableName: courseTable,
        KeyConditions: {
          ID: {
            ComparisonOperator: "EQ",
            AttributeValueList: [item.CourseID],
          },
        },
      };
      // console.log("courseQuery", courseQuery);
      try {
        let courseCommand = new QueryCommand(courseQuery);
        course = await docClient.send(courseCommand);
        // console.log("course", course);
        let countLecture = 0;
        if (course.Items.length > 0) {
          countLecture = await countProgress(course.Items[0], currentIdentity);
          const percent =
            (countLecture / course.Items[0].Chapters.length) * 100;
          data.Progress[i] = {
            CourseID: item.CourseID,
            ProgressPercent: percent,
            ProgressStatus: percent == 100 ? "Completed" : "In Progress",
          };
          console.log("data", data);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    }
    if (data.Progress.length > 0){
      userCourseProgress.push(data);
    }
    // console.log("userCourseProgress2", userCourseProgress);
  } catch (error) {
    console.log(error);
  }
};

export const handler = async (event) => {
  await calProgress();
  await putDataToDB(userCourseProgress);
};
