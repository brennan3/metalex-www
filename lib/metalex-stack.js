"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalexStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ALLOW_ORIGINS = [
    'http://localhost:3000',
    'https://miladyandmilady.com',
    'https://www.miladyandmilady.com'
];
const ALLOW_HEADERS = ['Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Origin', 'authorization'];
const getDefaultBucketCorsSettings = () => ({
    cors: [
        {
            allowedMethods: [aws_cdk_lib_1.aws_s3.HttpMethods.GET],
            allowedOrigins: ALLOW_ORIGINS,
            allowedHeaders: ALLOW_HEADERS,
        },
    ],
});
class MetalexStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = this.setupWebsiteBucket();
        const staticWebsiteResponseHeadersPolicy = new aws_cdk_lib_1.aws_cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
            responseHeadersPolicyName: 'StaticDataApiResponseHeadersPolicy',
            corsBehavior: {
                accessControlAllowCredentials: false,
                accessControlAllowHeaders: ALLOW_HEADERS,
                accessControlAllowMethods: ['GET', 'OPTIONS'],
                accessControlAllowOrigins: ALLOW_ORIGINS,
                accessControlMaxAge: aws_cdk_lib_1.Duration.seconds(300),
                originOverride: true,
            },
        });
        const commonDistributionBehaviors = {
            allowedMethods: aws_cdk_lib_1.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachedMethods: aws_cdk_lib_1.aws_cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            originRequestPolicy: aws_cdk_lib_1.aws_cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
            responseHeadersPolicy: staticWebsiteResponseHeadersPolicy,
            viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        };
        const distribution = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'ApiDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                ...commonDistributionBehaviors,
                origin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(bucket),
            },
            additionalBehaviors: {
                '/*': {
                    ...commonDistributionBehaviors,
                    origin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(bucket),
                }
            },
        });
        this.setupWebsiteS3StaticFileDeploy(bucket, distribution);
        this.distributionDomainName = new aws_cdk_lib_1.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });
    }
    setupWebsiteBucket() {
        return new aws_cdk_lib_1.aws_s3.Bucket(this, 'WebsiteBucket', { ...getDefaultBucketCorsSettings() });
    }
    setupWebsiteS3StaticFileDeploy(destinationBucket, distribution) {
        new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'StaticWebsiteFileDeploy', {
            sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset('./static/www')],
            cacheControl: [aws_cdk_lib_1.aws_s3_deployment.CacheControl.setPublic(), aws_cdk_lib_1.aws_s3_deployment.CacheControl.maxAge(aws_cdk_lib_1.Duration.minutes(5))],
            destinationBucket,
            destinationKeyPrefix: '/',
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
exports.MetalexStack = MetalexStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBU3FCO0FBR3JCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLHVCQUF1QjtJQUN2Qiw2QkFBNkI7SUFDN0IsaUNBQWlDO0NBQ2xDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLCtCQUErQixFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUVySCxNQUFNLDRCQUE0QixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsSUFBSSxFQUFFO1FBQ0o7WUFDRSxjQUFjLEVBQUUsQ0FBQyxvQkFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFDcEMsY0FBYyxFQUFFLGFBQWE7WUFDN0IsY0FBYyxFQUFFLGFBQWE7U0FDOUI7S0FDRjtDQUNGLENBQUMsQ0FBQztBQUVILE1BQWEsWUFBYSxTQUFRLG1CQUFLO0lBR3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFekMsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLDRCQUFVLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQzdHLHlCQUF5QixFQUFFLG9DQUFvQztZQUMvRCxZQUFZLEVBQUU7Z0JBQ1osNkJBQTZCLEVBQUUsS0FBSztnQkFDcEMseUJBQXlCLEVBQUUsYUFBYTtnQkFDeEMseUJBQXlCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO2dCQUM3Qyx5QkFBeUIsRUFBRSxhQUFhO2dCQUN4QyxtQkFBbUIsRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQzFDLGNBQWMsRUFBRSxJQUFJO2FBQ3JCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSwyQkFBMkIsR0FBRztZQUNsQyxjQUFjLEVBQUUsNEJBQVUsQ0FBQyxjQUFjLENBQUMsc0JBQXNCO1lBQ2hFLGFBQWEsRUFBRSw0QkFBVSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0I7WUFDOUQsbUJBQW1CLEVBQUUsNEJBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjO1lBQ2xFLHFCQUFxQixFQUFFLGtDQUFrQztZQUN6RCxvQkFBb0IsRUFBRSw0QkFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjtTQUN4RSxDQUFDO1FBRUYsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDeEUsaUJBQWlCLEVBQUUsWUFBWTtZQUMvQixlQUFlLEVBQUU7Z0JBQ2YsR0FBRywyQkFBMkI7Z0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNyQztZQUNELG1CQUFtQixFQUFFO2dCQUNuQixJQUFJLEVBQUU7b0JBQ0osR0FBRywyQkFBMkI7b0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDckM7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDMUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0I7U0FDM0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFFLEdBQUcsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELDhCQUE4QixDQUFDLGlCQUE0QixFQUFFLFlBQXFDO1FBQ2hHLElBQUksK0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDN0QsT0FBTyxFQUFFLENBQUMsK0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2hELFlBQVksRUFBRSxDQUFDLCtCQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxFQUFFLCtCQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLGlCQUFpQjtZQUNqQixvQkFBb0IsRUFBRSxHQUFHO1lBQ3pCLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvREQsb0NBK0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcbiAgYXdzX2Nsb3VkZnJvbnRfb3JpZ2lucyBhcyBvcmlnaW5zLFxuICBhd3NfczMgYXMgczMsXG4gIGF3c19zM19kZXBsb3ltZW50IGFzIHMzZGVwbG95LFxuICBDZm5PdXRwdXQsXG4gIER1cmF0aW9uLFxuICBTdGFjayxcbiAgU3RhY2tQcm9wcyxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmNvbnN0IEFMTE9XX09SSUdJTlMgPSBbXG4gICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAnaHR0cHM6Ly9taWxhZHlhbmRtaWxhZHkuY29tJyxcbiAgJ2h0dHBzOi8vd3d3Lm1pbGFkeWFuZG1pbGFkeS5jb20nXG5dO1xuXG5jb25zdCBBTExPV19IRUFERVJTID0gWydBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnLCAnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1NZXRob2QnLCAnT3JpZ2luJywgJ2F1dGhvcml6YXRpb24nXTtcblxuY29uc3QgZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncyA9ICgpID0+ICh7XG4gIGNvcnM6IFtcbiAgICB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLkdFVF0sXG4gICAgICBhbGxvd2VkT3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBBTExPV19IRUFERVJTLFxuICAgIH0sXG4gIF0sXG59KTtcblxuZXhwb3J0IGNsYXNzIE1ldGFsZXhTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgcmVhZG9ubHkgZGlzdHJpYnV0aW9uRG9tYWluTmFtZTogQ2ZuT3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgYnVja2V0ID0gdGhpcy5zZXR1cFdlYnNpdGVCdWNrZXQoKTtcbiAgICBcbiAgICBjb25zdCBzdGF0aWNXZWJzaXRlUmVzcG9uc2VIZWFkZXJzUG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuUmVzcG9uc2VIZWFkZXJzUG9saWN5KHRoaXMsICdSZXNwb25zZUhlYWRlcnNQb2xpY3knLCB7XG4gICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3lOYW1lOiAnU3RhdGljRGF0YUFwaVJlc3BvbnNlSGVhZGVyc1BvbGljeScsXG4gICAgICBjb3JzQmVoYXZpb3I6IHtcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93Q3JlZGVudGlhbHM6IGZhbHNlLFxuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dIZWFkZXJzOiBBTExPV19IRUFERVJTLFxuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dNZXRob2RzOiBbJ0dFVCcsICdPUFRJT05TJ10sXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd09yaWdpbnM6IEFMTE9XX09SSUdJTlMsXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xNYXhBZ2U6IER1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgICAgb3JpZ2luT3ZlcnJpZGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29tbW9uRGlzdHJpYnV0aW9uQmVoYXZpb3JzID0ge1xuICAgICAgYWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQWxsb3dlZE1ldGhvZHMuQUxMT1dfR0VUX0hFQURfT1BUSU9OUyxcbiAgICAgIGNhY2hlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQ2FjaGVkTWV0aG9kcy5DQUNIRV9HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgb3JpZ2luUmVxdWVzdFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5SZXF1ZXN0UG9saWN5LkNPUlNfUzNfT1JJR0lOLFxuICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5OiBzdGF0aWNXZWJzaXRlUmVzcG9uc2VIZWFkZXJzUG9saWN5LFxuICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgfTtcblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnQXBpRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oYnVja2V0KSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvKic6IHtcbiAgICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihidWNrZXQpLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXR1cFdlYnNpdGVTM1N0YXRpY0ZpbGVEZXBsb3koYnVja2V0LCBkaXN0cmlidXRpb24pO1xuXG4gICAgdGhpcy5kaXN0cmlidXRpb25Eb21haW5OYW1lID0gbmV3IENmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uRG9tYWluTmFtZScsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldHVwV2Vic2l0ZUJ1Y2tldCgpIHtcbiAgICByZXR1cm4gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnV2Vic2l0ZUJ1Y2tldCcsIHsgLi4uZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncygpIH0pO1xuICB9XG5cbiAgc2V0dXBXZWJzaXRlUzNTdGF0aWNGaWxlRGVwbG95KGRlc3RpbmF0aW9uQnVja2V0OiBzMy5CdWNrZXQsIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udC5EaXN0cmlidXRpb24pIHtcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnU3RhdGljV2Vic2l0ZUZpbGVEZXBsb3knLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KCcuL3N0YXRpYy93d3cnKV0sXG4gICAgICBjYWNoZUNvbnRyb2w6IFtzM2RlcGxveS5DYWNoZUNvbnRyb2wuc2V0UHVibGljKCksIHMzZGVwbG95LkNhY2hlQ29udHJvbC5tYXhBZ2UoRHVyYXRpb24ubWludXRlcyg1KSldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQsXG4gICAgICBkZXN0aW5hdGlvbktleVByZWZpeDogJy8nLFxuICAgICAgZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcbiAgfVxufVxuIl19