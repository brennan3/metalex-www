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
            domain: 'miladyandmilady.dev',
            subjectAlternativeNames: ['www.miladyandmilady.dev'],
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
            domain: 'miladyandmilady.com',
            subjectAlternativeNames: ['www.miladyandmilady.com'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1waXBlbGluZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtcGlwZWxpbmUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBT3VCO0FBQ3JCLHFEQUFrRDtBQUVsRCxtREFBK0M7QUFFL0MsTUFBTSwyQkFBMkIsR0FBRyx1Q0FBdUMsQ0FBQztBQUU1RSxNQUFhLG9CQUFxQixTQUFRLG1CQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxLQUFLLEdBQUcsdUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxFQUFFO1lBQ3BGLGFBQWEsRUFDWCxxR0FBcUc7U0FDeEcsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSx1QkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzVELFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSx1QkFBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RDLEtBQUs7Z0JBQ0wsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO2FBQ3RGLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3RELE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsdUJBQXVCLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztZQUNwRCxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7U0FDdEQsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQzdCLElBQUkscUJBQVMsQ0FBQyxpQkFBaUIsRUFBRTtZQUMvQixpQkFBaUIsRUFBRTtnQkFDakIsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQjthQUN0RDtZQUNELEtBQUs7WUFDTCxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDM0IsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7U0FDL0IsQ0FBQyxDQUNILENBQUM7UUFFRix1REFBdUQ7UUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSw0QkFBWSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN0RCxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLHVCQUF1QixFQUFFLENBQUMseUJBQXlCLENBQUM7WUFDcEQsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFO1NBQ3RELENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEIsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXpCLG1HQUFtRztRQUNuRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELDBCQUEwQixDQUFDLFFBQWdDO1FBQ3pELE1BQU0sS0FBSyxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDdkQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1DQUFhLENBQUMsaUJBQWlCLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1FBRXhGLElBQUksdUNBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDaEUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1lBQ3pCLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNoQixNQUFNLEVBQUU7Z0JBQ04sa0RBQWtEO2dCQUNsRCxpREFBaUQ7Z0JBQ2pELG1EQUFtRDtnQkFDbkQsb0RBQW9EO2dCQUNwRCxxREFBcUQ7Z0JBQ3JELGtEQUFrRDtnQkFDbEQsOENBQThDO2dCQUM5QyxpREFBaUQ7Z0JBQ2pELDhDQUE4QzthQUMvQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXBFRCxvREFvRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIGF3c19jb2Rlc3Rhcm5vdGlmaWNhdGlvbnMgYXMgbm90aWZpY2F0aW9ucyxcbiAgICBhd3Nfc25zIGFzIHNucyxcbiAgICBhd3Nfc25zX3N1YnNjcmlwdGlvbnMgYXMgc3Vic2NyaXB0aW9ucyxcbiAgICBwaXBlbGluZXMsXG4gICAgU3RhY2ssXG4gICAgU3RhY2tQcm9wcyxcbiAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG4gIGltcG9ydCB7IFNoZWxsU3RlcCB9IGZyb20gJ2F3cy1jZGstbGliL3BpcGVsaW5lcyc7XG4gIGltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuICBpbXBvcnQgeyBNZXRhbGV4U3RhZ2UgfSBmcm9tICcuL21ldGFsZXgtc3RhZ2UnO1xuICBcbiAgY29uc3QgUElQRUxJTkVfTk9USUZJQ0FUSU9OX0VNQUlMID0gJ3BsYXRmb3JtLWVuZ2luZWVyaW5nQGRlbHBoaWRpZ2l0YWwuaW8nO1xuICBcbiAgZXhwb3J0IGNsYXNzIE1ldGFsZXhQaXBlbGluZVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhY2tQcm9wcykge1xuICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gIFxuICAgICAgY29uc3QgaW5wdXQgPSBwaXBlbGluZXMuQ29kZVBpcGVsaW5lU291cmNlLmNvbm5lY3Rpb24oJ2JyZW5uYW4zL21ldGFsZXgtd3d3JywgJ21haW4nLCB7XG4gICAgICAgIGNvbm5lY3Rpb25Bcm46XG4gICAgICAgICAgJ2Fybjphd3M6Y29kZXN0YXItY29ubmVjdGlvbnM6dXMtZWFzdC0xOjkwNDg4MzgyNjkyMTpjb25uZWN0aW9uLzBiZWMyN2I0LTFiMDctNGIyNC05YWVjLWJhOWMzN2NmZTkxMCcsXG4gICAgICB9KTtcbiAgXG4gICAgICBjb25zdCBwaXBlbGluZSA9IG5ldyBwaXBlbGluZXMuQ29kZVBpcGVsaW5lKHRoaXMsICdQaXBlbGluZScsIHtcbiAgICAgICAgcGlwZWxpbmVOYW1lOiAnTWV0YWxleFBpcGVsaW5lJyxcbiAgICAgICAgY3Jvc3NBY2NvdW50S2V5czogdHJ1ZSxcbiAgICAgICAgc3ludGg6IG5ldyBwaXBlbGluZXMuU2hlbGxTdGVwKCdTeW50aCcsIHtcbiAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICBjb21tYW5kczogWyducG0gY2knLCAnbnBtIHJ1biBwcmVwYXJlJywgJ25wbSBydW4gYnVpbGQnLCAnbnBtIHRlc3QnLCAnbnB4IGNkayBzeW50aCddLFxuICAgICAgICB9KSxcbiAgICAgIH0pO1xuICBcbiAgICAgIGNvbnN0IGJldGEgPSBuZXcgTWV0YWxleFN0YWdlKHRoaXMsICdNZXRhbGV4QmV0YVN0YWdlJywge1xuICAgICAgICBkb21haW46ICdtaWxhZHlhbmRtaWxhZHkuZGV2JyxcbiAgICAgICAgc3ViamVjdEFsdGVybmF0aXZlTmFtZXM6IFsnd3d3Lm1pbGFkeWFuZG1pbGFkeS5kZXYnXSxcbiAgICAgICAgZW52OiB7IGFjY291bnQ6ICc2NDY5Mjc2NzA4OTEnLCByZWdpb246ICd1cy1lYXN0LTEnIH0sXG4gICAgICB9KTtcbiAgICAgIHBpcGVsaW5lLmFkZFN0YWdlKGJldGEpLmFkZFBvc3QoXG4gICAgICAgIG5ldyBTaGVsbFN0ZXAoJ0ludGVncmF0aW9uVGVzdCcsIHtcbiAgICAgICAgICBlbnZGcm9tQ2ZuT3V0cHV0czoge1xuICAgICAgICAgICAgRElTVFJJQlVUSU9OX0RPTUFJTl9OQU1FOiBiZXRhLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICBpbnN0YWxsQ29tbWFuZHM6IFsnbnBtIGNpJ10sXG4gICAgICAgICAgY29tbWFuZHM6IFsnbnBtIHJ1biB0ZXN0OmUyZSddLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgXG4gICAgICAvLyBUT0RPOiBhZGQgcHJvZCBzdGFnZSBvbmNlIGFjY291bnQgbGltaXQgaXMgaW5jcmVhc2VkXG4gICAgICBjb25zdCBwcm9kID0gbmV3IE1ldGFsZXhTdGFnZSh0aGlzLCAnTWV0YWxleFByb2RTdGFnZScsIHtcbiAgICAgICAgZG9tYWluOiAnbWlsYWR5YW5kbWlsYWR5LmNvbScsXG4gICAgICAgIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBbJ3d3dy5taWxhZHlhbmRtaWxhZHkuY29tJ10sXG4gICAgICAgIGVudjogeyBhY2NvdW50OiAnMDc0ODYxMTQzMjIxJywgcmVnaW9uOiAndXMtZWFzdC0xJyB9LFxuICAgICAgfSk7XG4gICAgICBwaXBlbGluZS5hZGRTdGFnZShwcm9kKTtcbiAgXG4gICAgICBwaXBlbGluZS5idWlsZFBpcGVsaW5lKCk7XG4gIFxuICAgICAgLy8gbXVzdCBiZSBjYWxsZWQgYWZ0ZXIgYnVpbGRpbmcgdGhlIHBpcGVsaW5lLCBvdGhlcndpc2UgdGhlIGludGVybmFsIHBpcGVsaW5lIGlzIG5vdCB5ZXQgYXZhaWxhYmxlXG4gICAgICB0aGlzLnNldHVwUGlwZWxpbmVOb3RpZmljYXRpb25zKHBpcGVsaW5lKTtcbiAgICB9XG4gIFxuICAgIHNldHVwUGlwZWxpbmVOb3RpZmljYXRpb25zKHBpcGVsaW5lOiBwaXBlbGluZXMuQ29kZVBpcGVsaW5lKTogdm9pZCB7XG4gICAgICBjb25zdCB0b3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ05vdGlmaWNhdGlvblRvcGljJyk7XG4gICAgICB0b3BpYy5hZGRTdWJzY3JpcHRpb24obmV3IHN1YnNjcmlwdGlvbnMuRW1haWxTdWJzY3JpcHRpb24oUElQRUxJTkVfTk9USUZJQ0FUSU9OX0VNQUlMKSk7XG4gIFxuICAgICAgbmV3IG5vdGlmaWNhdGlvbnMuTm90aWZpY2F0aW9uUnVsZSh0aGlzLCAnUGlwZWxpbmVOb3RpZmljYXRpb25zJywge1xuICAgICAgICBzb3VyY2U6IHBpcGVsaW5lLnBpcGVsaW5lLFxuICAgICAgICB0YXJnZXRzOiBbdG9waWNdLFxuICAgICAgICBldmVudHM6IFtcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1zdGFydGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1mYWlsZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLWNhbmNlbGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1zdWNjZWVkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXN1cGVyc2VkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtcGlwZWxpbmUtZXhlY3V0aW9uLXJlc3VtZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtbWFudWFsLWFwcHJvdmFsLW5lZWRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1tYW51YWwtYXBwcm92YWwtc3VjY2VlZGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLW1hbnVhbC1hcHByb3ZhbC1mYWlsZWQnLFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gICJdfQ==