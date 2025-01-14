import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';

const path = require('node:path');

dotenv.config();

export class NextjsLambdaCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const {
      AZURE_AD_CLIENT_ID,
      AZURE_AD_CLIENT_SECRET,
      AZURE_AD_TENANT_ID,
      NEXTAUTH_SECRET,
      NEXTAUTH_URL,
    }: any = process.env;

    const lambdaAdapterLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LambdaAdapterLayerX86',
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:3`
    );

    const nextCdkFunction = new lambda.Function(this, 'NextCdkFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'run.sh',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../app/.next/', 'standalone')
      ),
      architecture: lambda.Architecture.X86_64,
      environment: {
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
        RUST_LOG: 'info',
        PORT: '8080',
        AZURE_AD_CLIENT_ID,
        AZURE_AD_CLIENT_SECRET,
        AZURE_AD_TENANT_ID,
        NEXTAUTH_SECRET,
        NEXTAUTH_URL,
      },
      layers: [lambdaAdapterLayer],
      memorySize: 256,
    });

    const api = new apiGateway.RestApi(this, 'api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });

    const nextCdkFunctionIntegration = new apiGateway.LambdaIntegration(
      nextCdkFunction,
      {
        allowTestInvoke: false,
      }
    );
    api.root.addMethod('ANY', nextCdkFunctionIntegration);

    api.root.addProxy({
      defaultIntegration: new apiGateway.LambdaIntegration(nextCdkFunction, {
        allowTestInvoke: false,
      }),
      anyMethod: true,
    });

    const nextLoggingBucket = new s3.Bucket(this, 'next-logging-bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
    });

    const nextBucket = new s3.Bucket(this, 'next-bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      serverAccessLogsBucket: nextLoggingBucket,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      serverAccessLogsPrefix: 's3-access-logs',
    });

    new CfnOutput(this, 'Next bucket', { value: nextBucket.bucketName });

    const cloudfrontDistribution = new cloudfront.Distribution(
      this,
      'Distribution',
      {
        defaultBehavior: {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
        additionalBehaviors: {
          '_next/static/*': {
            origin: new origins.S3Origin(nextBucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          },
          'static/*': {
            origin: new origins.S3Origin(nextBucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          },
        },
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
        logBucket: nextLoggingBucket,
        logFilePrefix: 'cloudfront-access-logs',
      }
    );

    new CfnOutput(this, 'CloudFront URL', {
      value: `https://${cloudfrontDistribution.distributionDomainName}`,
    });

    new s3deploy.BucketDeployment(this, 'deploy-next-static-bucket', {
      sources: [s3deploy.Source.asset('app/.next/static/')],
      destinationBucket: nextBucket,
      destinationKeyPrefix: '_next/static',
      distribution: cloudfrontDistribution,
      distributionPaths: ['/_next/static/*'],
    });

    new s3deploy.BucketDeployment(this, 'deploy-next-public-bucket', {
      sources: [s3deploy.Source.asset('app/public/static/')],
      destinationBucket: nextBucket,
      destinationKeyPrefix: 'static',
      distribution: cloudfrontDistribution,
      distributionPaths: ['/static/*'],
    });
  }
}
