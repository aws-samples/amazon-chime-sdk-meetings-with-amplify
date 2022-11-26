# Amazon Chime SDK Meetings with Amplify

This repository can be used to deploy a basic [Amazon Chime SDK](https://aws.amazon.com/chime/chime-sdk/) Meeting using AWS Amplify.  

## To Use

### Install and Configure AWS Amplify

Follow the directions here: [https://docs.amplify.aws/cli/start/install/](https://docs.amplify.aws/cli/start/install/) to get started using AWS Amplify

### Clone Amplify Project

```
amplify init --app https://github.com/aws-samples/amazon-chime-sdk-meetings-with-amplify
```

This will clone and deploy this AWS Amplify [project](https://docs.amplify.aws/cli/start/workflows/#initialize-new-project).

## Contents

### Front End

This project includes a React based client.

### Back End

This project includes an AWS Amplify deployed back end that contains:
- Amazon Cognito
- Amazon API Gateway
- AWS Lambda functions

## Extending

This demo can be extended with many AWS Amplify components such as Amazon Transcribe and Amazon Translate.

## Cleanup

To remove these components:

```
amplify delete
```


