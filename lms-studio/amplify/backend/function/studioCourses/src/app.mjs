import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

// AWS.config.update({ region: process.env.TABLE_REGION });

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "courses";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "ID";
const partitionKeyType = "S";
const publicityIndex = "Publicity-index";
const creatorIDIndex = "CreatorID-index";
const viewsIndex = "Views-index";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/courses";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
const aCPath = "/:ac";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert infor string param to expected Type
const convertInfoType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path, function (req, res) {
  const userId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;

  let queryParams = {
    TableName: tableName,
    KeyConditionExpression: "CreatorID = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId },
    },
    IndexName: "CreatorID-index",
  };

  const command = new QueryCommand(queryParams);
  console.log(queryParams);

  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

//PUBLIC
app.get(path + "/public", function (req, res) {
  let queryParams = {
    TableName: tableName,
    IndexName: publicityIndex,
    KeyConditions: {
      Publicity: {
        ComparisonOperator: "EQ",
        AttributeValueList: [1],
      },
    },
    QueryFilter: {
      CreatorID: {
        ComparisonOperator: "NE",
        AttributeValueList: [
          req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(":CognitoSignIn:")[1],
        ],
      },
    },
  };

  const command = new QueryCommand(queryParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

//PRIVATE
app.get(path + "/private", function (req, res) {
  let queryParams = {
    TableName: tableName,
    IndexName: publicityIndex,
    KeyConditionExpression: "Publicity = :value",
    ExpressionAttributeValues: {
      ":value": 0,
    },
  };
  console.log(queryParams);

  const command = new QueryCommand(queryParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/myCourses", function (req, res) {
  let value = "";
  try {
    value =
      req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
        ":CognitoSignIn:"
      )[1];
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  let queryItemParams = {
    TableName: tableName,
    IndexName: creatorIDIndex,
    KeyConditionExpression: "CreatorID = :value",
    ExpressionAttributeValues: {
      ":value": value,
    },
  };

  const command = new QueryCommand(queryItemParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/topViews", function (req, res) {
  let scanParams = {
    TableName: tableName,
    IndexName: viewsIndex,
    Limit: Number("10"),
  };

  const command = new ScanCommand(scanParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

// /*****************************************
//  * HTTP Get method for get single object *
//  *****************************************/

app.get(path + hashKeyPath, function (req, res) {
  const params = {};

  try {
    params[partitionKeyName] = convertUrlType(
      req.params[partitionKeyName],
      partitionKeyType
    );
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  let getItemParams = {
    TableName: tableName,
    Key: params,
  };

  const command = new GetCommand(getItemParams);
  docClient.send(command).then(
    (data) => {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data);
      }
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

// /************************************
// * HTTP put method for insert object *
// *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["CreatorID"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  const command = new PutCommand(putItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ success: req.body, url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
    }
  );
});

// /************************************
// * HTTP post method for insert object *
// *************************************/

app.post(path, function (req, res) {
  req.body["CreatorID"] =
    req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
      ":CognitoSignIn:"
    )[1] || UNAUTH;

  // check if item exist or not
  if (req.body["OldID"]) {
    let deleteParams = {
      TableName: tableName,
      Key: { ID: req.body["OldID"] },
    };
    const deleteCommand = new DeleteCommand(deleteParams);
    docClient.send(deleteCommand).then(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // req.body = { ...req.body, OldID: _ }
  delete req.body["OldID"];
  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };

  const putCommand = new PutCommand(putItemParams);
  docClient.send(putCommand).then(
    (data) => {
      res.json({ success: req.body, url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
    }
  );
});

app.put(path + "/addAC" + aCPath, function (req, res) {
  const params = {};
  params[partitionKeyName] = req.params[partitionKeyName];
  try {
    params[partitionKeyName] = convertUrlType(
      req.params[partitionKeyName],
      partitionKeyType
    );
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  let upadteItemParams = {
    TableName: tableName,
    Key: params,
    UpdateExpression: "ADD #acC :vals",
    ExpressionAttributeNames: { "#acC": "AccessCode" },
    ExpressionAttributeValues: {
      ":vals": dynamodb.createSet([req.query["ac"]]),
    },
    ReturnValues: "UPDATED_NEW",
  };

  const command = new UpdateCommand(upadteItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ success: req.body, url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
    }
  );
});

// /************************************
// * HTTP put method for insert object *
// *************************************/

app.put(path + "/batchWrite", function (req, res) {
  let courseChunks = [];
  while (req.body.length > 0) {
    courseChunks.push(req.body.splice(0, 5));
  }
  // console.log("courseChunks", courseChunks)
  let promises = courseChunks.map((chunk) => {
    const putRequests = chunk.map((course) => {
      course["CreatorID"] =
        req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
          ":CognitoSignIn:"
        )[1] || UNAUTH;
      return {
        PutRequest: {
          Item: course,
        },
      };
    });
    console.log("putRequests", putRequests);
    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: putRequests,
      },
    });

    return new Promise((resolve, reject) => {
      docClient.send(command).then((data) => {
        console.log(data);
        resolve(data);
      }),
        (err) => {
          console.log(err);
          reject(err);
        };
    });
  });

  Promise.all(promises).then(function (results) {
    console.log(results);
    res.json({ results });
  });
});

// /**************************************
// * HTTP remove method to delete object *
// ***************************************/

app.delete(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};
  params[partitionKeyName] = req.params[partitionKeyName];
  try {
    params[partitionKeyName] = convertUrlType(
      req.params[partitionKeyName],
      partitionKeyType
    );
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params,
  };

  const command = new DeleteCommand(removeItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    }
  );
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app;
