import {
    aws_codestarnotifications as notifications,
    aws_sns as sns,
    aws_sns_subscriptions as subscriptions,
    pipelines,
    Stack,
    StackProps,
  } from 'aws-cdk-lib';
  import { ShellStep } from 'aws-cdk-lib/pipelines';
  import { Construct } from 'constructs';
  import { MetalexStage } from './metalex-stage';
  
  const PIPELINE_NOTIFICATION_EMAIL = 'platform-engineering@delphidigital.io';
  
  export class MetalexPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
      const input = pipelines.CodePipelineSource.connection('brennan3/metalex-www', 'main', {
        connectionArn:
          'arn:aws:codestar-connections:us-east-1:904883826921:connection/0bec27b4-1b07-4b24-9aec-ba9c37cfe910',
      });
  
      const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
        pipelineName: 'MetalexPipeline',
        crossAccountKeys: true,
        synth: new pipelines.ShellStep('Synth', {
          input,
          commands: ['npm ci', 'npm run prepare', 'npm run build', 'npm test', 'npx cdk synth'],
        }),
      });
  
      const beta = new MetalexStage(this, 'MetalexBetaStage', {
        domain: 'www.miladyandmilady.dev',
        env: { account: '646927670891', region: 'us-east-1' },
      });
      pipeline.addStage(beta).addPost(
        new ShellStep('IntegrationTest', {
          envFromCfnOutputs: {
            DISTRIBUTION_DOMAIN_NAME: beta.distributionDomainName,
          },
          input,
          installCommands: ['npm ci'],
          commands: ['npm run test:e2e'],
        })
      );
  
      // TODO: add prod stage once account limit is increased
      const prod = new MetalexStage(this, 'MetalexProdStage', {
        domain: 'www.miladyandmilady.com',
        env: { account: '074861143221', region: 'us-east-1' },
      });
      pipeline.addStage(prod);
  
      pipeline.buildPipeline();
  
      // must be called after building the pipeline, otherwise the internal pipeline is not yet available
      this.setupPipelineNotifications(pipeline);
    }
  
    setupPipelineNotifications(pipeline: pipelines.CodePipeline): void {
      const topic = new sns.Topic(this, 'NotificationTopic');
      topic.addSubscription(new subscriptions.EmailSubscription(PIPELINE_NOTIFICATION_EMAIL));
  
      new notifications.NotificationRule(this, 'PipelineNotifications', {
        source: pipeline.pipeline,
        targets: [topic],
        events: [
          'codepipeline-pipeline-pipeline-execution-started',
          'codepipeline-pipeline-pipeline-execution-failed',
          'codepipeline-pipeline-pipeline-execution-canceled',
          'codepipeline-pipeline-pipeline-execution-succeeded',
          'codepipeline-pipeline-pipeline-execution-superseded',
          'codepipeline-pipeline-pipeline-execution-resumed',
          'codepipeline-pipeline-manual-approval-needed',
          'codepipeline-pipeline-manual-approval-succeeded',
          'codepipeline-pipeline-manual-approval-failed',
        ],
      });
    }
  }
  