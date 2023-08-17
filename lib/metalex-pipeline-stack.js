"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalexPipelineStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const pipelines_1 = require("aws-cdk-lib/pipelines");
const metalex_stage_1 = require("./metalex-stage");
const PIPELINE_NOTIFICATION_EMAIL = 'platform-engineering@delphidigital.io';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1waXBlbGluZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtcGlwZWxpbmUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBT3VCO0FBQ3JCLHFEQUFrRDtBQUVsRCxtREFBK0M7QUFFL0MsTUFBTSwyQkFBMkIsR0FBRyx1Q0FBdUMsQ0FBQztBQUU1RSxNQUFhLG9CQUFxQixTQUFRLG1CQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxLQUFLLEdBQUcsdUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxFQUFFO1lBQ3BGLGFBQWEsRUFDWCxxR0FBcUc7U0FDeEcsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSx1QkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzVELFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSx1QkFBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RDLEtBQUs7Z0JBQ0wsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO2FBQ3RGLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3RELEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtTQUN0RCxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FDN0IsSUFBSSxxQkFBUyxDQUFDLGlCQUFpQixFQUFFO1lBQy9CLGlCQUFpQixFQUFFO2dCQUNqQix3QkFBd0IsRUFBRSxJQUFJLENBQUMsc0JBQXNCO2FBQ3REO1lBQ0QsS0FBSztZQUNMLGVBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUMzQixRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztTQUMvQixDQUFDLENBQ0gsQ0FBQztRQUVGLHVEQUF1RDtRQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3RELEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtTQUN0RCxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUV6QixtR0FBbUc7UUFDbkcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCwwQkFBMEIsQ0FBQyxRQUFnQztRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxtQ0FBYSxDQUFDLGlCQUFpQixDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUV4RixJQUFJLHVDQUFhLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ2hFLE1BQU0sRUFBRSxRQUFRLENBQUMsUUFBUTtZQUN6QixPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDaEIsTUFBTSxFQUFFO2dCQUNOLGtEQUFrRDtnQkFDbEQsaURBQWlEO2dCQUNqRCxtREFBbUQ7Z0JBQ25ELG9EQUFvRDtnQkFDcEQscURBQXFEO2dCQUNyRCxrREFBa0Q7Z0JBQ2xELDhDQUE4QztnQkFDOUMsaURBQWlEO2dCQUNqRCw4Q0FBOEM7YUFDL0M7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoRUQsb0RBZ0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBhd3NfY29kZXN0YXJub3RpZmljYXRpb25zIGFzIG5vdGlmaWNhdGlvbnMsXG4gICAgYXdzX3NucyBhcyBzbnMsXG4gICAgYXdzX3Nuc19zdWJzY3JpcHRpb25zIGFzIHN1YnNjcmlwdGlvbnMsXG4gICAgcGlwZWxpbmVzLFxuICAgIFN0YWNrLFxuICAgIFN0YWNrUHJvcHMsXG4gIH0gZnJvbSAnYXdzLWNkay1saWInO1xuICBpbXBvcnQgeyBTaGVsbFN0ZXAgfSBmcm9tICdhd3MtY2RrLWxpYi9waXBlbGluZXMnO1xuICBpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbiAgaW1wb3J0IHsgTWV0YWxleFN0YWdlIH0gZnJvbSAnLi9tZXRhbGV4LXN0YWdlJztcbiAgXG4gIGNvbnN0IFBJUEVMSU5FX05PVElGSUNBVElPTl9FTUFJTCA9ICdwbGF0Zm9ybS1lbmdpbmVlcmluZ0BkZWxwaGlkaWdpdGFsLmlvJztcbiAgXG4gIGV4cG9ydCBjbGFzcyBNZXRhbGV4UGlwZWxpbmVTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICBcbiAgICAgIGNvbnN0IGlucHV0ID0gcGlwZWxpbmVzLkNvZGVQaXBlbGluZVNvdXJjZS5jb25uZWN0aW9uKCdicmVubmFuMy9tZXRhbGV4LXd3dycsICdtYWluJywge1xuICAgICAgICBjb25uZWN0aW9uQXJuOlxuICAgICAgICAgICdhcm46YXdzOmNvZGVzdGFyLWNvbm5lY3Rpb25zOnVzLWVhc3QtMTo5MDQ4ODM4MjY5MjE6Y29ubmVjdGlvbi8wYmVjMjdiNC0xYjA3LTRiMjQtOWFlYy1iYTljMzdjZmU5MTAnLFxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgcGlwZWxpbmUgPSBuZXcgcGlwZWxpbmVzLkNvZGVQaXBlbGluZSh0aGlzLCAnUGlwZWxpbmUnLCB7XG4gICAgICAgIHBpcGVsaW5lTmFtZTogJ01ldGFsZXhQaXBlbGluZScsXG4gICAgICAgIGNyb3NzQWNjb3VudEtleXM6IHRydWUsXG4gICAgICAgIHN5bnRoOiBuZXcgcGlwZWxpbmVzLlNoZWxsU3RlcCgnU3ludGgnLCB7XG4gICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgY29tbWFuZHM6IFsnbnBtIGNpJywgJ25wbSBydW4gcHJlcGFyZScsICducG0gcnVuIGJ1aWxkJywgJ25wbSB0ZXN0JywgJ25weCBjZGsgc3ludGgnXSxcbiAgICAgICAgfSksXG4gICAgICB9KTtcbiAgXG4gICAgICBjb25zdCBiZXRhID0gbmV3IE1ldGFsZXhTdGFnZSh0aGlzLCAnTWV0YWxleEJldGFTdGFnZScsIHtcbiAgICAgICAgZW52OiB7IGFjY291bnQ6ICc2NDY5Mjc2NzA4OTEnLCByZWdpb246ICd1cy1lYXN0LTEnIH0sXG4gICAgICB9KTtcbiAgICAgIHBpcGVsaW5lLmFkZFN0YWdlKGJldGEpLmFkZFBvc3QoXG4gICAgICAgIG5ldyBTaGVsbFN0ZXAoJ0ludGVncmF0aW9uVGVzdCcsIHtcbiAgICAgICAgICBlbnZGcm9tQ2ZuT3V0cHV0czoge1xuICAgICAgICAgICAgRElTVFJJQlVUSU9OX0RPTUFJTl9OQU1FOiBiZXRhLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICBpbnN0YWxsQ29tbWFuZHM6IFsnbnBtIGNpJ10sXG4gICAgICAgICAgY29tbWFuZHM6IFsnbnBtIHJ1biB0ZXN0OmUyZSddLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgXG4gICAgICAvLyBUT0RPOiBhZGQgcHJvZCBzdGFnZSBvbmNlIGFjY291bnQgbGltaXQgaXMgaW5jcmVhc2VkXG4gICAgICBjb25zdCBwcm9kID0gbmV3IE1ldGFsZXhTdGFnZSh0aGlzLCAnTWV0YWxleFByb2RTdGFnZScsIHtcbiAgICAgICAgZW52OiB7IGFjY291bnQ6ICcwNzQ4NjExNDMyMjEnLCByZWdpb246ICd1cy1lYXN0LTEnIH0sXG4gICAgICB9KTtcbiAgICAgIHBpcGVsaW5lLmFkZFN0YWdlKHByb2QpO1xuICBcbiAgICAgIHBpcGVsaW5lLmJ1aWxkUGlwZWxpbmUoKTtcbiAgXG4gICAgICAvLyBtdXN0IGJlIGNhbGxlZCBhZnRlciBidWlsZGluZyB0aGUgcGlwZWxpbmUsIG90aGVyd2lzZSB0aGUgaW50ZXJuYWwgcGlwZWxpbmUgaXMgbm90IHlldCBhdmFpbGFibGVcbiAgICAgIHRoaXMuc2V0dXBQaXBlbGluZU5vdGlmaWNhdGlvbnMocGlwZWxpbmUpO1xuICAgIH1cbiAgXG4gICAgc2V0dXBQaXBlbGluZU5vdGlmaWNhdGlvbnMocGlwZWxpbmU6IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmUpOiB2b2lkIHtcbiAgICAgIGNvbnN0IHRvcGljID0gbmV3IHNucy5Ub3BpYyh0aGlzLCAnTm90aWZpY2F0aW9uVG9waWMnKTtcbiAgICAgIHRvcGljLmFkZFN1YnNjcmlwdGlvbihuZXcgc3Vic2NyaXB0aW9ucy5FbWFpbFN1YnNjcmlwdGlvbihQSVBFTElORV9OT1RJRklDQVRJT05fRU1BSUwpKTtcbiAgXG4gICAgICBuZXcgbm90aWZpY2F0aW9ucy5Ob3RpZmljYXRpb25SdWxlKHRoaXMsICdQaXBlbGluZU5vdGlmaWNhdGlvbnMnLCB7XG4gICAgICAgIHNvdXJjZTogcGlwZWxpbmUucGlwZWxpbmUsXG4gICAgICAgIHRhcmdldHM6IFt0b3BpY10sXG4gICAgICAgIGV2ZW50czogW1xuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXN0YXJ0ZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLWZhaWxlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tY2FuY2VsZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXN1Y2NlZWRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tc3VwZXJzZWRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tcmVzdW1lZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1tYW51YWwtYXBwcm92YWwtbmVlZGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLW1hbnVhbC1hcHByb3ZhbC1zdWNjZWVkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtbWFudWFsLWFwcHJvdmFsLWZhaWxlZCcsXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgIl19