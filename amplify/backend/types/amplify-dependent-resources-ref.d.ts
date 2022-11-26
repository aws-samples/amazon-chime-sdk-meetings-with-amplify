export type AmplifyDependentResourcesAttributes = {
  function: {
    createMeeting: {
      Name: 'string';
      Arn: 'string';
      Region: 'string';
      LambdaExecutionRole: 'string';
    };
    endMeeting: {
      Name: 'string';
      Arn: 'string';
      Region: 'string';
      LambdaExecutionRole: 'string';
    };
  };
  api: {
    meetingApi: {
      RootUrl: 'string';
      ApiName: 'string';
      ApiId: 'string';
    };
  };
  auth: {
    biz307amplify5b0bba085b0bba08: {
      IdentityPoolId: 'string';
      IdentityPoolName: 'string';
      UserPoolId: 'string';
      UserPoolArn: 'string';
      UserPoolName: 'string';
      AppClientIDWeb: 'string';
      AppClientID: 'string';
    };
  };
};
