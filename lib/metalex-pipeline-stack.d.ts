import { pipelines, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class MetalexPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps);
    setupPipelineNotifications(pipeline: pipelines.CodePipeline): void;
}
