import { CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface MetalexStageProps extends StageProps {
    domain: string;
}
export declare class MetalexStage extends Stage {
    readonly distributionDomainName: CfnOutput;
    constructor(scope: Construct, id: string, { domain, ...props }: MetalexStageProps);
}
