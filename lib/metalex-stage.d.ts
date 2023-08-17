import { CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class MetalexStage extends Stage {
    readonly distributionDomainName: CfnOutput;
    constructor(scope: Construct, id: string, props?: StageProps);
}
