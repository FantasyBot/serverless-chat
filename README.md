# Serverless Chat

This CloudFormation template deploys a serverless chat application using AWS services.

## Description

The Serverless Chat application uses AWS Lambda, DynamoDB, and API Gateway WebSocket API to enable real-time communication between clients.

## Architecture

The application is built using the following AWS services:

- AWS Lambda
- AWS WebSocket API
- AWS DynamoDB

## This repository contains integrations from:

- ### serverless-chat-dynamodb
- ### serverless-chat-s3

And for the front end side :

- ### serverless-chat-ui

#

## Deployment

To deploy the Serverless Chat application, follow these steps:

1. you alsow need to install `sam-cli`
2. `AWS Named Profiles` configure it with your aws credentials
3. Run: `export AWS_PROFILE=your_profile_name && sam build && sam deploy --config-env dev`

## Components

The Serverless Chat application consists of the following components:

- **ChatWebsocketApi**: An API Gateway WebSocket API for handling chat messages.
- **ConnectLambdaFunction**: AWS Lambda function that handles the connection event when a client connects to the WebSocket API.
- **DisconnectLambdaFunction**: AWS Lambda function that handles the disconnection event when a client disconnects from the WebSocket API.
- **SendMessageLambdaFunction**: AWS Lambda function that handles sending messages between clients.
- **GetClientsLambdaFunction**: AWS Lambda function that retrieves the list of connected clients.
- **GetMessagesLambdaFunction**: AWS Lambda function that retrieves the chat message history.
- **ClientsTableName**: DynamoDB table for storing information about connected clients.
- **MessagesTableName**: DynamoDB table for storing chat messages.

#
