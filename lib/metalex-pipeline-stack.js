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
            domain: 'www.miladyandmilady.dev',
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
            domain: 'www.miladyandmilady.com',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1waXBlbGluZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtcGlwZWxpbmUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBT3VCO0FBQ3JCLHFEQUFrRDtBQUVsRCxtREFBK0M7QUFFL0MsTUFBTSwyQkFBMkIsR0FBRyx1Q0FBdUMsQ0FBQztBQUU1RSxNQUFhLG9CQUFxQixTQUFRLG1CQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxLQUFLLEdBQUcsdUJBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxFQUFFO1lBQ3BGLGFBQWEsRUFDWCxxR0FBcUc7U0FDeEcsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSx1QkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzVELFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixLQUFLLEVBQUUsSUFBSSx1QkFBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RDLEtBQUs7Z0JBQ0wsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO2FBQ3RGLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3RELE1BQU0sRUFBRSx5QkFBeUI7WUFDakMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFO1NBQ3RELENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUM3QixJQUFJLHFCQUFTLENBQUMsaUJBQWlCLEVBQUU7WUFDL0IsaUJBQWlCLEVBQUU7Z0JBQ2pCLHdCQUF3QixFQUFFLElBQUksQ0FBQyxzQkFBc0I7YUFDdEQ7WUFDRCxLQUFLO1lBQ0wsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzNCLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixDQUFDO1NBQy9CLENBQUMsQ0FDSCxDQUFDO1FBRUYsdURBQXVEO1FBQ3ZELE1BQU0sSUFBSSxHQUFHLElBQUksNEJBQVksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDdEQsTUFBTSxFQUFFLHlCQUF5QjtZQUNqQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7U0FDdEQsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFekIsbUdBQW1HO1FBQ25HLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsMEJBQTBCLENBQUMsUUFBZ0M7UUFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQkFBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN2RCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksbUNBQWEsQ0FBQyxpQkFBaUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSx1Q0FBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUNoRSxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDekIsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2hCLE1BQU0sRUFBRTtnQkFDTixrREFBa0Q7Z0JBQ2xELGlEQUFpRDtnQkFDakQsbURBQW1EO2dCQUNuRCxvREFBb0Q7Z0JBQ3BELHFEQUFxRDtnQkFDckQsa0RBQWtEO2dCQUNsRCw4Q0FBOEM7Z0JBQzlDLGlEQUFpRDtnQkFDakQsOENBQThDO2FBQy9DO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBbEVELG9EQWtFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgYXdzX2NvZGVzdGFybm90aWZpY2F0aW9ucyBhcyBub3RpZmljYXRpb25zLFxuICAgIGF3c19zbnMgYXMgc25zLFxuICAgIGF3c19zbnNfc3Vic2NyaXB0aW9ucyBhcyBzdWJzY3JpcHRpb25zLFxuICAgIHBpcGVsaW5lcyxcbiAgICBTdGFjayxcbiAgICBTdGFja1Byb3BzLFxuICB9IGZyb20gJ2F3cy1jZGstbGliJztcbiAgaW1wb3J0IHsgU2hlbGxTdGVwIH0gZnJvbSAnYXdzLWNkay1saWIvcGlwZWxpbmVzJztcbiAgaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG4gIGltcG9ydCB7IE1ldGFsZXhTdGFnZSB9IGZyb20gJy4vbWV0YWxleC1zdGFnZSc7XG4gIFxuICBjb25zdCBQSVBFTElORV9OT1RJRklDQVRJT05fRU1BSUwgPSAncGxhdGZvcm0tZW5naW5lZXJpbmdAZGVscGhpZGlnaXRhbC5pbyc7XG4gIFxuICBleHBvcnQgY2xhc3MgTWV0YWxleFBpcGVsaW5lU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgXG4gICAgICBjb25zdCBpbnB1dCA9IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmVTb3VyY2UuY29ubmVjdGlvbignYnJlbm5hbjMvbWV0YWxleC13d3cnLCAnbWFpbicsIHtcbiAgICAgICAgY29ubmVjdGlvbkFybjpcbiAgICAgICAgICAnYXJuOmF3czpjb2Rlc3Rhci1jb25uZWN0aW9uczp1cy1lYXN0LTE6OTA0ODgzODI2OTIxOmNvbm5lY3Rpb24vMGJlYzI3YjQtMWIwNy00YjI0LTlhZWMtYmE5YzM3Y2ZlOTEwJyxcbiAgICAgIH0pO1xuICBcbiAgICAgIGNvbnN0IHBpcGVsaW5lID0gbmV3IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmUodGhpcywgJ1BpcGVsaW5lJywge1xuICAgICAgICBwaXBlbGluZU5hbWU6ICdNZXRhbGV4UGlwZWxpbmUnLFxuICAgICAgICBjcm9zc0FjY291bnRLZXlzOiB0cnVlLFxuICAgICAgICBzeW50aDogbmV3IHBpcGVsaW5lcy5TaGVsbFN0ZXAoJ1N5bnRoJywge1xuICAgICAgICAgIGlucHV0LFxuICAgICAgICAgIGNvbW1hbmRzOiBbJ25wbSBjaScsICducG0gcnVuIHByZXBhcmUnLCAnbnBtIHJ1biBidWlsZCcsICducG0gdGVzdCcsICducHggY2RrIHN5bnRoJ10sXG4gICAgICAgIH0pLFxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgYmV0YSA9IG5ldyBNZXRhbGV4U3RhZ2UodGhpcywgJ01ldGFsZXhCZXRhU3RhZ2UnLCB7XG4gICAgICAgIGRvbWFpbjogJ3d3dy5taWxhZHlhbmRtaWxhZHkuZGV2JyxcbiAgICAgICAgZW52OiB7IGFjY291bnQ6ICc2NDY5Mjc2NzA4OTEnLCByZWdpb246ICd1cy1lYXN0LTEnIH0sXG4gICAgICB9KTtcbiAgICAgIHBpcGVsaW5lLmFkZFN0YWdlKGJldGEpLmFkZFBvc3QoXG4gICAgICAgIG5ldyBTaGVsbFN0ZXAoJ0ludGVncmF0aW9uVGVzdCcsIHtcbiAgICAgICAgICBlbnZGcm9tQ2ZuT3V0cHV0czoge1xuICAgICAgICAgICAgRElTVFJJQlVUSU9OX0RPTUFJTl9OQU1FOiBiZXRhLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICBpbnN0YWxsQ29tbWFuZHM6IFsnbnBtIGNpJ10sXG4gICAgICAgICAgY29tbWFuZHM6IFsnbnBtIHJ1biB0ZXN0OmUyZSddLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgXG4gICAgICAvLyBUT0RPOiBhZGQgcHJvZCBzdGFnZSBvbmNlIGFjY291bnQgbGltaXQgaXMgaW5jcmVhc2VkXG4gICAgICBjb25zdCBwcm9kID0gbmV3IE1ldGFsZXhTdGFnZSh0aGlzLCAnTWV0YWxleFByb2RTdGFnZScsIHtcbiAgICAgICAgZG9tYWluOiAnd3d3Lm1pbGFkeWFuZG1pbGFkeS5jb20nLFxuICAgICAgICBlbnY6IHsgYWNjb3VudDogJzA3NDg2MTE0MzIyMScsIHJlZ2lvbjogJ3VzLWVhc3QtMScgfSxcbiAgICAgIH0pO1xuICAgICAgcGlwZWxpbmUuYWRkU3RhZ2UocHJvZCk7XG4gIFxuICAgICAgcGlwZWxpbmUuYnVpbGRQaXBlbGluZSgpO1xuICBcbiAgICAgIC8vIG11c3QgYmUgY2FsbGVkIGFmdGVyIGJ1aWxkaW5nIHRoZSBwaXBlbGluZSwgb3RoZXJ3aXNlIHRoZSBpbnRlcm5hbCBwaXBlbGluZSBpcyBub3QgeWV0IGF2YWlsYWJsZVxuICAgICAgdGhpcy5zZXR1cFBpcGVsaW5lTm90aWZpY2F0aW9ucyhwaXBlbGluZSk7XG4gICAgfVxuICBcbiAgICBzZXR1cFBpcGVsaW5lTm90aWZpY2F0aW9ucyhwaXBlbGluZTogcGlwZWxpbmVzLkNvZGVQaXBlbGluZSk6IHZvaWQge1xuICAgICAgY29uc3QgdG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdOb3RpZmljYXRpb25Ub3BpYycpO1xuICAgICAgdG9waWMuYWRkU3Vic2NyaXB0aW9uKG5ldyBzdWJzY3JpcHRpb25zLkVtYWlsU3Vic2NyaXB0aW9uKFBJUEVMSU5FX05PVElGSUNBVElPTl9FTUFJTCkpO1xuICBcbiAgICAgIG5ldyBub3RpZmljYXRpb25zLk5vdGlmaWNhdGlvblJ1bGUodGhpcywgJ1BpcGVsaW5lTm90aWZpY2F0aW9ucycsIHtcbiAgICAgICAgc291cmNlOiBwaXBlbGluZS5waXBlbGluZSxcbiAgICAgICAgdGFyZ2V0czogW3RvcGljXSxcbiAgICAgICAgZXZlbnRzOiBbXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tc3RhcnRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tZmFpbGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1jYW5jZWxlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1waXBlbGluZS1leGVjdXRpb24tc3VjY2VlZGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1zdXBlcnNlZGVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLXBpcGVsaW5lLWV4ZWN1dGlvbi1yZXN1bWVkJyxcbiAgICAgICAgICAnY29kZXBpcGVsaW5lLXBpcGVsaW5lLW1hbnVhbC1hcHByb3ZhbC1uZWVkZWQnLFxuICAgICAgICAgICdjb2RlcGlwZWxpbmUtcGlwZWxpbmUtbWFudWFsLWFwcHJvdmFsLXN1Y2NlZWRlZCcsXG4gICAgICAgICAgJ2NvZGVwaXBlbGluZS1waXBlbGluZS1tYW51YWwtYXBwcm92YWwtZmFpbGVkJyxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAiXX0=