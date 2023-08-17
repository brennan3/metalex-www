import { aws_cloudfront as cloudfront, aws_s3 as s3, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class MetalexStack extends Stack {
    readonly distributionDomainName: CfnOutput;
    constructor(scope: Construct, id: string, props?: StackProps);
    setupWebsiteBucket(): s3.Bucket;
    setupWebsiteS3StaticFileDeploy(destinationBucket: s3.Bucket, distribution: cloudfront.Distribution): void;
}
