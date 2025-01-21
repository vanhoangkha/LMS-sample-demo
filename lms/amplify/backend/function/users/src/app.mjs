import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "Users";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "UserID";
const partitionKeyType = "S";
const path = "/users";
const UNAUTH = "UNAUTH";

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
  // const condition = {}
  // condition[partitionKeyName] = {
  //   ComparisonOperator: 'EQ'
  // }
  // if (userIdPresent && req.apiGateway) {
  //   condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // } else {
  //   try {
  //     condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }
  // let queryParams = {
  //   TableName: tableName,
  //   KeyConditions: condition
  // }
  // const command = new QueryCommand(queryParams);
  // docClient.send(command).then(
  //   (data) => {
  //     res.json(data.Items);
  //   },
  //   (err) => {
  //     console.log(err);
  //     res.statusCode = 500;
  //     res.json({ error: "Could not load items: " + err });
  //   }
  // );
});

app.put(path, function (req, res) {
  if (userIdPresent) {
  }

  let getItemParams = {
    TableName: tableName,
    Key: {
      UserID: req.body["UserID"],
    },
  };
  let getCommand = new GetCommand(getItemParams);

  docClient.send(getCommand).then(
    (data) => {
      if (data.Item) {
        let putItemParams = {
          TableName: tableName,
          Item: req.body,
        };

        const command = new PutCommand(putItemParams);
        docClient.send(command).then(
          (data) => {
            res.json({
              success: "put call succeed!",
              url: req.url,
              data: data,
            });
          },
          (err) => {
            console.log(err)
            res.statusCode = 500;
            res.json({ error: err, info: req.info, body: req.body });
          }
        );
      } else {
        res.json({ success: "put call succeed!", url: req.url, data: data });
      }
    },
    (err) => {
      console.log(err)
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
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
