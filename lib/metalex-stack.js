"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalexStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ALLOW_ORIGINS = [
    'http://localhost:3000',
    'https://miladyandmilady.com'
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
            defaultBehavior: {
                ...commonDistributionBehaviors,
                origin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(bucket),
            },
            additionalBehaviors: {
                '/static/www*': {
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
            destinationKeyPrefix: 'static/www',
            distribution,
            distributionPaths: ['/static/www*'],
        });
    }
}
exports.MetalexStack = MetalexStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBU3FCO0FBR3JCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLHVCQUF1QjtJQUN2Qiw2QkFBNkI7Q0FDOUIsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsK0JBQStCLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRXJILE1BQU0sNEJBQTRCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxQyxJQUFJLEVBQUU7UUFDSjtZQUNFLGNBQWMsRUFBRSxDQUFDLG9CQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUNwQyxjQUFjLEVBQUUsYUFBYTtZQUM3QixjQUFjLEVBQUUsYUFBYTtTQUM5QjtLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFHckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUV6QyxNQUFNLGtDQUFrQyxHQUFHLElBQUksNEJBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDN0cseUJBQXlCLEVBQUUsb0NBQW9DO1lBQy9ELFlBQVksRUFBRTtnQkFDWiw2QkFBNkIsRUFBRSxLQUFLO2dCQUNwQyx5QkFBeUIsRUFBRSxhQUFhO2dCQUN4Qyx5QkFBeUIsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7Z0JBQzdDLHlCQUF5QixFQUFFLGFBQWE7Z0JBQ3hDLG1CQUFtQixFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDMUMsY0FBYyxFQUFFLElBQUk7YUFDckI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLDJCQUEyQixHQUFHO1lBQ2xDLGNBQWMsRUFBRSw0QkFBVSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0I7WUFDaEUsYUFBYSxFQUFFLDRCQUFVLENBQUMsYUFBYSxDQUFDLHNCQUFzQjtZQUM5RCxtQkFBbUIsRUFBRSw0QkFBVSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7WUFDbEUscUJBQXFCLEVBQUUsa0NBQWtDO1lBQ3pELG9CQUFvQixFQUFFLDRCQUFVLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCO1NBQ3hFLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN4RSxlQUFlLEVBQUU7Z0JBQ2YsR0FBRywyQkFBMkI7Z0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNyQztZQUNELG1CQUFtQixFQUFFO2dCQUNuQixjQUFjLEVBQUU7b0JBQ2QsR0FBRywyQkFBMkI7b0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDckM7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDMUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0I7U0FDM0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFFLEdBQUcsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELDhCQUE4QixDQUFDLGlCQUE0QixFQUFFLFlBQXFDO1FBQ2hHLElBQUksK0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDN0QsT0FBTyxFQUFFLENBQUMsK0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2hELFlBQVksRUFBRSxDQUFDLCtCQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxFQUFFLCtCQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLGlCQUFpQjtZQUNqQixvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLGNBQWMsQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE5REQsb0NBOERDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcbiAgYXdzX2Nsb3VkZnJvbnRfb3JpZ2lucyBhcyBvcmlnaW5zLFxuICBhd3NfczMgYXMgczMsXG4gIGF3c19zM19kZXBsb3ltZW50IGFzIHMzZGVwbG95LFxuICBDZm5PdXRwdXQsXG4gIER1cmF0aW9uLFxuICBTdGFjayxcbiAgU3RhY2tQcm9wcyxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmNvbnN0IEFMTE9XX09SSUdJTlMgPSBbXG4gICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAnaHR0cHM6Ly9taWxhZHlhbmRtaWxhZHkuY29tJ1xuXTtcblxuY29uc3QgQUxMT1dfSEVBREVSUyA9IFsnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1IZWFkZXJzJywgJ0FjY2Vzcy1Db250cm9sLVJlcXVlc3QtTWV0aG9kJywgJ09yaWdpbicsICdhdXRob3JpemF0aW9uJ107XG5cbmNvbnN0IGdldERlZmF1bHRCdWNrZXRDb3JzU2V0dGluZ3MgPSAoKSA9PiAoe1xuICBjb3JzOiBbXG4gICAge1xuICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5HRVRdLFxuICAgICAgYWxsb3dlZE9yaWdpbnM6IEFMTE9XX09SSUdJTlMsXG4gICAgICBhbGxvd2VkSGVhZGVyczogQUxMT1dfSEVBREVSUyxcbiAgICB9LFxuICBdLFxufSk7XG5cbmV4cG9ydCBjbGFzcyBNZXRhbGV4U3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbkRvbWFpbk5hbWU6IENmbk91dHB1dDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMuc2V0dXBXZWJzaXRlQnVja2V0KCk7XG4gICAgXG4gICAgY29uc3Qgc3RhdGljV2Vic2l0ZVJlc3BvbnNlSGVhZGVyc1BvbGljeSA9IG5ldyBjbG91ZGZyb250LlJlc3BvbnNlSGVhZGVyc1BvbGljeSh0aGlzLCAnUmVzcG9uc2VIZWFkZXJzUG9saWN5Jywge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5TmFtZTogJ1N0YXRpY0RhdGFBcGlSZXNwb25zZUhlYWRlcnNQb2xpY3knLFxuICAgICAgY29yc0JlaGF2aW9yOiB7XG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd0NyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93SGVhZGVyczogQUxMT1dfSEVBREVSUyxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93TWV0aG9kczogWydHRVQnLCAnT1BUSU9OUyddLFxuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dPcmlnaW5zOiBBTExPV19PUklHSU5TLFxuICAgICAgICBhY2Nlc3NDb250cm9sTWF4QWdlOiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICAgIG9yaWdpbk92ZXJyaWRlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbW1vbkRpc3RyaWJ1dGlvbkJlaGF2aW9ycyA9IHtcbiAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICBjYWNoZWRNZXRob2RzOiBjbG91ZGZyb250LkNhY2hlZE1ldGhvZHMuQ0FDSEVfR0VUX0hFQURfT1BUSU9OUyxcbiAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5DT1JTX1MzX09SSUdJTixcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeTogc3RhdGljV2Vic2l0ZVJlc3BvbnNlSGVhZGVyc1BvbGljeSxcbiAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgIH07XG5cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ0FwaURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oYnVja2V0KSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvc3RhdGljL3d3dyonOiB7XG4gICAgICAgICAgLi4uY29tbW9uRGlzdHJpYnV0aW9uQmVoYXZpb3JzLFxuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oYnVja2V0KSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0dXBXZWJzaXRlUzNTdGF0aWNGaWxlRGVwbG95KGJ1Y2tldCwgZGlzdHJpYnV0aW9uKTtcblxuICAgIHRoaXMuZGlzdHJpYnV0aW9uRG9tYWluTmFtZSA9IG5ldyBDZm5PdXRwdXQodGhpcywgJ0Rpc3RyaWJ1dGlvbkRvbWFpbk5hbWUnLCB7XG4gICAgICB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgfSk7XG4gIH1cblxuICBzZXR1cFdlYnNpdGVCdWNrZXQoKSB7XG4gICAgcmV0dXJuIG5ldyBzMy5CdWNrZXQodGhpcywgJ1dlYnNpdGVCdWNrZXQnLCB7IC4uLmdldERlZmF1bHRCdWNrZXRDb3JzU2V0dGluZ3MoKSB9KTtcbiAgfVxuXG4gIHNldHVwV2Vic2l0ZVMzU3RhdGljRmlsZURlcGxveShkZXN0aW5hdGlvbkJ1Y2tldDogczMuQnVja2V0LCBkaXN0cmlidXRpb246IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKSB7XG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1N0YXRpY1dlYnNpdGVGaWxlRGVwbG95Jywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldCgnLi9zdGF0aWMvd3d3JyldLFxuICAgICAgY2FjaGVDb250cm9sOiBbczNkZXBsb3kuQ2FjaGVDb250cm9sLnNldFB1YmxpYygpLCBzM2RlcGxveS5DYWNoZUNvbnRyb2wubWF4QWdlKER1cmF0aW9uLm1pbnV0ZXMoNSkpXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0LFxuICAgICAgZGVzdGluYXRpb25LZXlQcmVmaXg6ICdzdGF0aWMvd3d3JyxcbiAgICAgIGRpc3RyaWJ1dGlvbixcbiAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbJy9zdGF0aWMvd3d3KiddLFxuICAgIH0pO1xuICB9XG59XG4iXX0=