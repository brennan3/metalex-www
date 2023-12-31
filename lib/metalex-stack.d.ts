import { aws_cloudfront as cloudfront, aws_s3 as s3, aws_certificatemanager, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface MetalexStackProps extends StackProps {
    domainName: string;
    subjectAlternativeNames: string[];
}
export declare class MetalexStack extends Stack {
    readonly distributionDomainName: CfnOutput;
    constructor(scope: Construct, id: string, { domainName, subjectAlternativeNames, ...props }: MetalexStackProps);
    setupWebsiteBucket(): s3.Bucket;
    setupCertification(domainName: string, subjectAlternativeNames: string[]): aws_certificatemanager.Certificate;
    setupWebsiteS3StaticFileDeploy(destinationBucket: s3.Bucket, distribution: cloudfront.Distribution): void;
}
