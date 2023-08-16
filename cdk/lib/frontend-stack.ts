import * as cdk from 'aws-cdk-lib';
import { Construct,  } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as assets from 'aws-cdk-lib/aws-s3-assets';
import * as amplify from '@aws-cdk/aws-amplify-alpha';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const asset = new assets.Asset(this, 'SampleAsset', {
      path: 'frontend/build',
    });

    const amplifyApp = new amplify.App(this, "BlueprintApp", {});

    const main = amplifyApp.addBranch("main", {
      asset: asset,
    });

    new cdk.CfnOutput(this, "AmplifyAppURL", {value: `https://${main.branchName}.${amplifyApp.appId}.amplifyapp.com`})
  }
}