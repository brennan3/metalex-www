import { CfnOutput, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MetalexStack } from './metalex-stack';

export class MetalexStage extends Stage {
  readonly distributionDomainName: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const metalexStack = new MetalexStack(this, 'MetalexStack');
    this.distributionDomainName = metalexStack.distributionDomainName;
  }
}
