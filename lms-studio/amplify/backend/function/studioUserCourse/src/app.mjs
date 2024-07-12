import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "UserCourse";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "UserID";
const partitionKeyType = "S";
const sortKeyName = "CourseID";
const sortKeyType = "S";
const courseIndex = "Courses-index";
const paritionKeyNameIndex = "CourseID" 
const hasSortKey = sortKeyName !== "";
const path = "/usercourse";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const hashKeyIndexPath = '/:' + paritionKeyNameIndex;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

// /********************************
//  * HTTP Get method for list objects *
//  ********************************/

app.get(path, function(req, res) {
  const condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }
  condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
  }

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

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
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

app.get(path + "/assigned" + hashKeyIndexPath, function(req, res) {
    const condition = {}
    condition[paritionKeyNameIndex] = {
      ComparisonOperator: 'EQ'
    }
    condition[paritionKeyNameIndex]['AttributeValueList'] = [req.params[paritionKeyNameIndex]];
  
    let queryParams = {
      TableName: tableName,
      IndexName: courseIndex,
      KeyConditions: condition
    }
  
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
})

// /************************************
// * HTTP put method for insert object *
// *************************************/

app.put(path, function (req, res) {
  console.log(req.body);
  // if (userIdPresent) {
  //   req.body['CreatorID'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  // }
  let promises = req.body.map((item) => {
    let putItemParams = {
      TableName: tableName,
      Item: item,
      ReturnValues: "ALL_OLD",
    };

    const command = new PutCommand(putItemParams);
    return docClient.send(command).promise().then((data) => {
        return data
      },
      (err) => {
        return err
      }
    );
  });

  Promise.all(promises).then(function (results) {
    console.log(results);
    res.json({ results });
  });
});

// /**************************************
// * HTTP remove method to delete object *
// ***************************************/

app.delete(path, function (req, res) {
  let promises = req.body.map((item) => {
    const params = {};
    params[partitionKeyName] = item[partitionKeyName];
    params[sortKeyName] = item[sortKeyName];

    let removeItemParams = {
      TableName: tableName,
      Key: params,
    };

    const command = new DeleteCommand(removeItemParams);

    return docClient.send(command).promise().then(
        (data) => {
          return data;
        },
        (err) => {
          return err;
        }
      );
  });

  Promise.all(promises).then(function (results) {
    console.log(results);
    res.json({ results });
  });
});

// /**************************************
// * HTTP remove method to delete object *
// ***************************************/

app.delete(path + sortKeyPath, function (req, res) {
  let condition = {};

  condition[sortKeyName] = {
    ComparisonOperator: "EQ",
  };

  condition[sortKeyName]["AttributeValueList"] = [req.params[sortKeyName]];

  let scanItemParams = {
    TableName: tableName,
    ScanFilter: condition,
  };

  const scanCommand = new ScanCommand(scanItemParams);
  docClient.send(scanCommand).then(
    (data) => {
      let promises = data.Items.map((item) => {
        const params = {};
        params[partitionKeyName] = item[partitionKeyName];
        params[sortKeyName] = item[sortKeyName];

        let removeItemParams = {
          TableName: tableName,
          Key: params,
        };

        return dynamodb.delete(removeItemParams).promise().then(
            (data) => {
              return data;
            }, 
            (err) => {
              console.log("delete error ", err);
              return err;
            });
      });
      Promise.all(promises).then(function (results) {
        console.log(results);
        res.json({ results });
      });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
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