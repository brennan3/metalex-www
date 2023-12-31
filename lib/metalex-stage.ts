import { CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MetalexStack } from './metalex-stack';

export interface MetalexStageProps extends StageProps {
  domainName: string,
  subjectAlternativeNames: string[]
}

export class MetalexStage extends Stage {
  readonly distributionDomainName: CfnOutput;

  constructor(scope: Construct, id: string, { domainName, subjectAlternativeNames, ...props }: MetalexStageProps) {
    super(scope, id, props);

    const metalexStack = new MetalexStack(this, 'MetalexStack', { domainName, subjectAlternativeNames });
    this.distributionDomainName = metalexStack.distributionDomainName;
  }
}
