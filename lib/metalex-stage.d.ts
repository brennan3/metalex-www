import { CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface MetalexStageProps extends StageProps {
    domain: string;
    subjectAlternativeNames: string[];
}
export declare class MetalexStage extends Stage {
    readonly distributionDomainName: CfnOutput;
    constructor(scope: Construct, id: string, { domain, subjectAlternativeNames, ...props }: MetalexStageProps);
}
