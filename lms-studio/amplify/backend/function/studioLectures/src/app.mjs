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

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "Lectures";
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
const path = "/lectures";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";

// declare a new express app
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
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
  // const condition = {};
  // condition[sortKeyName] = {
  //   ComparisonOperator: "EQ",
  // };
  // condition[sortKeyName]["AttributeValueList"] = [
  //   req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH,
  // ];
  let lectureList = [];
  let scanParams = {
    TableName: tableName,
    ProjectionExpression: "ID, #name, #duration, #type",
    ExpressionAttributeNames: {
      "#name": "Name",
      "#duration": "Length",
      "#type": "Type",
    },
  };

  const command = new ScanCommand(scanParams);
  docClient.send(command).then(
    (data) => {
      // res.json(data.Items);
      lectureList = [...lectureList, ...data.Items];
      let resquest = data;
      while (resquest.LastEvaluatedKey) {
        const command = {
          TableName: tableName,
          ExclusiveStartKey: response["LastEvaluatedKey"],
        };
        docClient.send(command).then((data) => {
          lectureList = [...lectureList, ...data.Items];
          resquest = data;
        });
      }
      res.json(lectureList);
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
  const condition = {};
  condition[sortKeyName] = {
    ComparisonOperator: "EQ",
  };

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
          req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
            ":CognitoSignIn:"
          )[1],
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

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/myLectures", function (req, res) {
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
    Limit: "10",
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
      req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
        ":CognitoSignIn:"
      )[1] || UNAUTH;
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
// * HTTP put method for insert object *
// *************************************/

app.put(path + "/batchWrite", function (req, res) {
  let lectureChunks = [];
  while (req.body.length > 0) {
    lectureChunks.push(req.body.splice(0, 10));
  }
  // console.log("lectureChunks", lectureChunks)
  let promises = lectureChunks.map((chunk) => {
    const putRequests = chunk.map((lecture) => {
      lecture["CreatorID"] =
        req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
          ":CognitoSignIn:"
        )[1] || UNAUTH;
      return {
        PutRequest: {
          Item: lecture,
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

app.post(path, function (req, res) {
  req.body["CreatorID"] =
    req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
      ":CognitoSignIn:"
    )[1] || UNAUTH;

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
