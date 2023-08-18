"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalexPipelineStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const pipelines_1 = require("aws-cdk-lib/pipelines");
const metalex_stage_1 = require("./metalex-stage");
const PIPELINE_NOTIFICATION_EMAIL = 'metalex-tech@googlegroups.com';
const BETA_DOMAIN_NAME = 'miladyandmilady.dev';
const BETA_SUBJECT_ALTERNATIVE_NAMES = ['www.miladyandmilady.dev'];
const PROD_DOMAIN_NAME = 'miladyandmilady.com';
const PROD_SUBJECT_ALTERNATIVE_NAMES = ['www.miladyandmilady.com'];
class MetalexPipelineStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const input = aws_cdk_lib_1.pipelines.CodePipelineSource.connection('brennan3/metalex-www', 'main', {
            connectionArn: 'arn:aws:codestar-connections:us-east-1:904883826921:connection/0bec27b4-1b07-4b24-9aec-ba9c37cfe910',
        });
        const pipeline = new aws_cdk_lib_1.pipelines.CodePipeline(this, 'Pipeline', {
            pipelineName: 'MetalexPipeline',
            crossAccountKeys: true,
            synth: new aws_cdk_lib_1.pipelines.ShellStep('Synth', {
                input,
                commands: ['npm ci', 'npm run prepare', 'npm run build', 'npm test', 'npx cdk synth'],
            }),
        });
        const beta = new metalex_stage_1.MetalexStage(this, 'MetalexBetaStage', {
            domainName: BETA_DOMAIN_NAME,
            subjectAlternativeNames: BETA_SUBJECT_ALTERNATIVE_NAMES,
            env: { account: '646927670891', region: 'us-east-1' },
        });
        pipeline.addStage(beta).addPost(new pipelines_1.ShellStep('IntegrationTest', {
            envFromCfnOutputs: {
                DISTRIBUTION_DOMAIN_NAME: beta.distributionDomainName,
            },
            input,
            installCommands: ['npm ci'],
            commands: ['npm run test:e2e'],
        }));
        // TODO: add prod stage once account limit is increased
        const prod = new metalex_stage_1.MetalexStage(this, 'MetalexProdStage', {
            domainName: PROD_DOMAIN_NAME,
            subjectAlternativeNames: PROD_SUBJECT_ALTERNATIVE_NAMES,
            env: { account: '074861143221', region: 'us-east-1' },
        });
        pipeline.addStage(prod);
        pipeline.buildPipeline();
        // must be called after building the pipeline, otherwise the internal pipeline is not yet available
        this.setupPipelineNotifications(pipeline);
    }
    setupPipelineNotifications(pipeline) {
        const topic = new aws_cdk_lib_1.aws_sns.Topic(this, 'NotificationTopic');
        topic.addSubscription(new aws_cdk_lib_1.aws_sns_subscriptions.EmailSubscription(PIPELINE_NOTIFICATION_EMAIL));
        new aws_cdk_lib_1.aws_codestarnotifications.NotificationRule(this, 'PipelineNotifications', {
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
exports.MetalexPipelineStack = MetalexPipelineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1waXBlbGluZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtcGlwZWxpbmUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBT3VCO0FBQ3JCLHFEQUFrRDtBQUVsRCxtREFBK0M7QUFFL0MsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQztBQUVwRSxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDO0FBQy9DLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUM7QUFDL0MsTUFBTSw4QkFBOEIsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFbkUsTUFBYSxvQkFBcUIsU0FBUSxtQkFBSztJQUM3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzFELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLHVCQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRTtZQUNwRixhQUFhLEVBQ1gscUdBQXFHO1NBQ3hHLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLElBQUksdUJBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM1RCxZQUFZLEVBQUUsaUJBQWlCO1lBQy9CLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsS0FBSyxFQUFFLElBQUksdUJBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO2dCQUN0QyxLQUFLO2dCQUNMLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQzthQUN0RixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSw0QkFBWSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN0RCxVQUFVLEVBQUUsZ0JBQWdCO1lBQzVCLHVCQUF1QixFQUFFLDhCQUE4QjtZQUN2RCxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7U0FDdEQsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQzdCLElBQUkscUJBQVMsQ0FBQyxpQkFBaUIsRUFBRTtZQUMvQixpQkFBaUIsRUFBRTtnQkFDakIsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQjthQUN0RDtZQUNELEtBQUs7WUFDTCxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDM0IsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7U0FDL0IsQ0FBQyxDQUNILENBQUM7UUFFRix1REFBdUQ7UUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSw0QkFBWSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN0RCxVQUFVLEVBQUUsZ0JBQWdCO1lBQzVCLHVCQUF1QixFQUFFLDhCQUE4QjtZQUN2RCxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7U0FDdEQsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFekIsbUdBQW1HO1FBQ25HLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsMEJBQTBCLENBQUMsUUFBZ0M7UUFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQkFBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN2RCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksbUNBQWEsQ0FBQyxpQkFBaUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSx1Q0FBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUNoRSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDekIsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2hCLE1BQU0sRUFBRTtnQkFDTixrREFBa0Q7Z0JBQ2xELGlEQUFpRDtnQkFDakQsbURBQW1EO2dCQUNuRCxvREFBb0Q7Z0JBQ3BELHFEQUFxRDtnQkFDckQsa0RBQWtEO2dCQUNsRCw4Q0FBOEM7Z0JBQzlDLGlEQUFpRDtnQkFDakQsOENBQThDO2FBQy9DO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcEVELG9EQW9FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgYXdzX2NvZGVzdGFybm90aWZpY2F0aW9ucyBhcyBub3RpZmljYXRpb25zLFxuICAgIGF3c19zbnMgYXMgc25zLFxuICAgIGF3c19zbnNfc3Vic2NyaXB0aW9ucyBhcyBzdWJzY3JpcHRpb25zLFxuICAgIHBpcGVsaW5lcyxcbiAgICBTdGFjayxcbiAgICBTdGFja1Byb3BzLFxuICB9IGZyb20gJ2F3cy1jZGstbGliJztcbiAgaW1wb3J0IHsgU2hlbGxTdGVwIH0gZnJvbSAnYXdzLWNkay1saWIvcGlwZWxpbmVzJztcbiAgaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG4gIGltcG9ydCB7IE1ldGFsZXhTdGFnZSB9IGZyb20gJy4vbWV0YWxleC1zdGFnZSc7XG4gIFxuICBjb25zdCBQSVBFTElORV9OT1RJRklDQVRJT05fRU1BSUwgPSAnbWV0YWxleC10ZWNoQGdvb2dsZWdyb3Vwcy5jb20nO1xuICBcbiAgY29uc3QgQkVUQV9ET01BSU5fTkFNRSA9ICdtaWxhZHlhbmRtaWxhZHkuZGV2JztcbiAgY29uc3QgQkVUQV9TVUJKRUNUX0FMVEVSTkFUSVZFX05BTUVTID0gWyd3d3cubWlsYWR5YW5kbWlsYWR5LmRldiddO1xuXG4gIGNvbnN0IFBST0RfRE9NQUlOX05BTUUgPSAnbWlsYWR5YW5kbWlsYWR5LmNvbSc7XG4gIGNvbnN0IFBST0RfU1VCSkVDVF9BTFRFUk5BVElWRV9OQU1FUyA9IFsnd3d3Lm1pbGFkeWFuZG1pbGFkeS5jb20nXTtcblxuICBleHBvcnQgY2xhc3MgTWV0YWxleFBpcGVsaW5lU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgXG4gICAgICBjb25zdCBpbnB1dCA9IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmVTb3VyY2UuY29ubmVjdGlvbignYnJlbm5hbjMvbWV0YWxleC13d3cnLCAnbWFpbicsIHtcbiAgICAgICAgY29ubmVjdGlvbkFybjpcbiAgICAgICAgICAnYXJuOmF3czpjb2Rlc3Rhci1jb25uZWN0aW9uczp1cy1lYXN0LTE6OTA0ODgzODI2OTIxOmNvbm5lY3Rpb24vMGJlYzI3YjQtMWIwNy00YjI0LTlhZWMtYmE5YzM3Y2ZlOTEwJyxcbiAgICAgIH0pO1xuICBcbiAgICAgIGNvbnN0IHBpcGVsaW5lID0gbmV3IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmUodGhpcywgJ1BpcGVsaW5lJywge1xuICAgICAgICBwaXBlbGluZU5hbWU6ICdNZXRhbGV4UGlwZWxpbmUnLFxuICAgICAgICBjcm9zc0FjY291bnRLZXlzOiB0cnVlLFxuICAgICAgICBzeW50aDogbmV3IHBpcGVsaW5lcy5TaGVsbFN0ZXAoJ1N5bnRoJywge1xuICAgICAgICAgIGlucHV0LFxuICAgICAgICAgIGNvbW1hbmRzOiBbJ25wbSBjaScsICducG0gcnVuIHByZXBhcmUnLCAnbnBtIHJ1biBidWlsZCcsICducG0gdGVzdCcsICducHggY2RrIHN5bnRoJ10sXG4gICAgICAgIH0pLFxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgYmV0YSA9IG5ldyBNZXRhbGV4U3RhZ2UodGhpcywgJ01ldGFsZXhCZXRhU3RhZ2UnLCB7XG4gICAgICAgIGRvbWFpbk5hbWU6IEJFVEFfRE9NQUlOX05BTUUsXG4gICAgICAgIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBCRVRBX1NVQkpFQ1RfQUxURVJOQVRJVkVfTkFNRVMsXG4gICAgICAgIGVudjogeyBhY2NvdW50OiAnNjQ2OTI3NjcwODkxJywgcmVnaW9uOiAndXMtZWFzdC0xJyB9LFxuICAgICAgfSk7XG4gICAgICBwaXBlbGluZS5hZGRTdGFnZShiZXRhKS5hZGRQb3N0KFxuICAgICAgICBuZXcgU2hlbGxTdGVwKCdJbnRlZ3JhdGlvblRlc3QnLCB7XG4gICAgICAgICAgZW52RnJvbUNmbk91dHB1dHM6IHtcbiAgICAgICAgICAgIERJU1RSSUJVVElPTl9ET01BSU5fTkFNRTogYmV0YS5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgaW5zdGFsbENvbW1hbmRzOiBbJ25wbSBjaSddLFxuICAgICAgICAgIGNvbW1hbmRzOiBbJ25wbSBydW4gdGVzdDplMmUnXSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIFxuICAgICAgLy8gVE9ETzogYWRkIHByb2Qgc3RhZ2Ugb25jZSBhY2NvdW50IGxpbWl0IGlzIGluY3JlYXNlZFxuICAgICAgY29uc3QgcHJvZCA9IG5ldyBNZXRhbGV4U3RhZ2UodGhpcywgJ01ldGFsZXhQcm9kU3RhZ2UnLCB7XG4gICAgICAgIGRvbWFpbk5hbWU6IFBST0RfRE9NQUlOX05BTUUsXG4gICAgICAgIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBQUk9EX1NVQkpFQ1RfQUxURVJOQVRJVkVfTkFNRVMsXG4gICAgICAgIGVudjogeyBhY2NvdW50OiAnMDc0ODYxMTQzMjIxJywgcmVnaW9uOiAndXMtZWFzdC0xJyB9LFxuICAgICAgfSk7XG4gICAgICBwaXBlbGluZS5hZGRTdGFnZShwcm9kKTtcbiAgXG4gICAgICBwaXBlbGluZS5idWlsZFBpcGVsaW5lKCk7XG4gIFxuICAgICAgLy8gbXVzdCBiZSBjYWxsZWQgYWZ0ZXIgYnVpbGRpbmcgdGhlIHBpcGVsaW5lLCBvdGhlcndpc2UgdGhlIGludGVybmFsIHBpcGVsaW5lIGlzIG5vdCB5ZXQgYXZhaWxhYmxlXG4gICAgICB0aGlzLnNldHVwUGlwZWxpbmVOb3RpZmljYXRpb25zKHBpcGVsaW5lKTtcbiAgICB9XG4gIFxuICAgIHNldHVwUGlwZWxpbmVOb3RpZmljYXRpb25zKHBpcGVsaW5lOiBwaXBlbGluZXMuQ29kZVBpcGVsaW5lKTogdm9pZCB7XG4gICAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ05vdGlmaWNhdGlvblRvcGljJyk7XG4gICAgICB0b3BpYy5hZGRTdWJzY3JpcHRpb24obmV3IHN1YnNjcmlwdGlvbnMuRW1haWxTdWJzY3JpcHRpb24oUElQRUxJTkVfTk9USUZJQ0FUSU9OX0VNQUlMKSk7XG4gIFxuICAgICAgbmV3IG5vdGlmaWNhdGlvbnMuTm90aWZpY2F0aW9uUnVsZSh0aGlzLCAnUGlwZWxpbmVOb3RpZmljYXRpb25zJywge1xuICAgICAgICBzb3VyY2U6IHBpcGVsaW5lLnBpcGVsaW5lLFxuICAgICAgICB0YXJnZXRzOiBbdG9waWNdLFxuICAgICAgICBldmVudHM6IFtcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1zdGFydGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1mYWlsZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLWNhbmNlbGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1zdWNjZWVkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXN1cGVyc2VkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXJlc3VtZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtbWFudWFsLWFwcHJvdmFsLW5lZWRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1tYW51YWwtYXBwcm92YWwtc3VjY2VlZGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLW1hbnVhbC1hcHByb3ZhbC1mYWlsZWQnLFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gICJdfQ==