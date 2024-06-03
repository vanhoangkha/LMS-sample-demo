/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

// AWS.config.update({ region: process.env.TABLE_REGION });

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "Contributor";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "contributorID";
const partitionKeyType = "S";
const viewsIndex = "views-index";
const path = "/contributor";
const hashKeyPath = "/:" + partitionKeyName;
const UNAUTH = "UNAUTH";

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


/**********************
 * Example get method *
 **********************/

app.get('/item', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/topContributor", function (req, res) {
  let getItemParams = {
    TableName: tableName,
    IndexName: viewsIndex,
    Limit: Number("5"),
  };
  let command = new ScanCommand(getItemParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err)
      res.statusCode = 500;
      res.json({error: 'Could not load items: ' + err});
    }
  );
});

/****************************
* Example post method *
****************************/

app.post('/item', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app;
