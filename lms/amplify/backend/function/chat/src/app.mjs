import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

const client = new BedrockAgentRuntimeClient({
  region: "us-east-1",
});

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

app.get('/chat', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/chat/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/chat', function(req, res) {
  // Add your code here
  const question = req.body
  const input = {
    // RetrieveAndGenerateRequest
    input: {
      // RetrieveAndGenerateInput
      text: question, // required
    },
    retrieveAndGenerateConfiguration: {
      // RetrieveAndGenerateConfiguration
      type: "KNOWLEDGE_BASE", // required
      knowledgeBaseConfiguration: {
        // KnowledgeBaseRetrieveAndGenerateConfiguration
        knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID, // required
        modelArn: "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2", // required
      },
    },
  };
  console.log(input)
  const command = new RetrieveAndGenerateCommand(input);
  client.send(command).then(
    (data) => {
      res.json(data.output.text);
    },
    (error) => {
      console.log(error)
      res.statusCode = 500;
      res.json({ error: error, info: req.info, body: req.body });
    }
  );
});

app.post('/chat/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/chat', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/chat/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/chat', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/chat/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app
