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
    constructor(scope, id, { domain, ...props }) {
        super(scope, id, props);
        const bucket = this.setupWebsiteBucket();
        const cert = this.setupCertification(domain);
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
            certificate: cert,
            domainNames: [domain],
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
    setupCertification(domainName) {
        // if domain is in r53, the dns validationr records will be auto created
        return new aws_cdk_lib_1.aws_certificatemanager.Certificate(this, 'Certificate', {
            domainName,
            validation: aws_cdk_lib_1.aws_certificatemanager.CertificateValidation.fromDns(), // Records must be added manually
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBVXFCO0FBR3JCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLHVCQUF1QjtJQUN2Qiw2QkFBNkI7SUFDN0IsaUNBQWlDO0NBQ2xDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLCtCQUErQixFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUVySCxNQUFNLDRCQUE0QixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsSUFBSSxFQUFFO1FBQ0o7WUFDRSxjQUFjLEVBQUUsQ0FBQyxvQkFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFDcEMsY0FBYyxFQUFFLGFBQWE7WUFDN0IsY0FBYyxFQUFFLGFBQWE7U0FDOUI7S0FDRjtDQUNGLENBQUMsQ0FBQztBQU1ILE1BQWEsWUFBYSxTQUFRLG1CQUFLO0lBR3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLEVBQXFCO1FBQy9FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRXpDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3QyxNQUFNLGtDQUFrQyxHQUFHLElBQUksNEJBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDN0cseUJBQXlCLEVBQUUsb0NBQW9DO1lBQy9ELFlBQVksRUFBRTtnQkFDWiw2QkFBNkIsRUFBRSxLQUFLO2dCQUNwQyx5QkFBeUIsRUFBRSxhQUFhO2dCQUN4Qyx5QkFBeUIsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7Z0JBQzdDLHlCQUF5QixFQUFFLGFBQWE7Z0JBQ3hDLG1CQUFtQixFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDMUMsY0FBYyxFQUFFLElBQUk7YUFDckI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLDJCQUEyQixHQUFHO1lBQ2xDLGNBQWMsRUFBRSw0QkFBVSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0I7WUFDaEUsYUFBYSxFQUFFLDRCQUFVLENBQUMsYUFBYSxDQUFDLHNCQUFzQjtZQUM5RCxtQkFBbUIsRUFBRSw0QkFBVSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7WUFDbEUscUJBQXFCLEVBQUUsa0NBQWtDO1lBQ3pELG9CQUFvQixFQUFFLDRCQUFVLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCO1NBQ3hFLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN4RSxXQUFXLEVBQUUsSUFBSTtZQUNqQixXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDckIsaUJBQWlCLEVBQUUsWUFBWTtZQUMvQixlQUFlLEVBQUU7Z0JBQ2YsR0FBRywyQkFBMkI7Z0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNyQztZQUNELG1CQUFtQixFQUFFO2dCQUNuQixJQUFJLEVBQUU7b0JBQ0osR0FBRywyQkFBMkI7b0JBQzlCLE1BQU0sRUFBRSxJQUFJLG9DQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDckM7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDMUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0I7U0FDM0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFFLEdBQUcsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELGtCQUFrQixDQUFDLFVBQWtCO1FBQ25DLHdFQUF3RTtRQUN4RSxPQUFPLElBQUksb0NBQXNCLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDakUsVUFBVTtZQUNWLFVBQVUsRUFBRSxvQ0FBc0IsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxpQ0FBaUM7U0FDdEcsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDhCQUE4QixDQUFDLGlCQUE0QixFQUFFLFlBQXFDO1FBQ2hHLElBQUksK0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDN0QsT0FBTyxFQUFFLENBQUMsK0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2hELFlBQVksRUFBRSxDQUFDLCtCQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxFQUFFLCtCQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLGlCQUFpQjtZQUNqQixvQkFBb0IsRUFBRSxHQUFHO1lBQ3pCLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEzRUQsb0NBMkVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcbiAgYXdzX2Nsb3VkZnJvbnRfb3JpZ2lucyBhcyBvcmlnaW5zLFxuICBhd3NfczMgYXMgczMsXG4gIGF3c19zM19kZXBsb3ltZW50IGFzIHMzZGVwbG95LFxuICBhd3NfY2VydGlmaWNhdGVtYW5hZ2VyLFxuICBDZm5PdXRwdXQsXG4gIER1cmF0aW9uLFxuICBTdGFjayxcbiAgU3RhY2tQcm9wcyxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmNvbnN0IEFMTE9XX09SSUdJTlMgPSBbXG4gICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAnaHR0cHM6Ly9taWxhZHlhbmRtaWxhZHkuY29tJyxcbiAgJ2h0dHBzOi8vd3d3Lm1pbGFkeWFuZG1pbGFkeS5jb20nXG5dO1xuXG5jb25zdCBBTExPV19IRUFERVJTID0gWydBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnLCAnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1NZXRob2QnLCAnT3JpZ2luJywgJ2F1dGhvcml6YXRpb24nXTtcblxuY29uc3QgZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncyA9ICgpID0+ICh7XG4gIGNvcnM6IFtcbiAgICB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLkdFVF0sXG4gICAgICBhbGxvd2VkT3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBBTExPV19IRUFERVJTLFxuICAgIH0sXG4gIF0sXG59KTtcblxuZXhwb3J0IGludGVyZmFjZSBNZXRhbGV4U3RhY2tQcm9wcyBleHRlbmRzIFN0YWNrUHJvcHMge1xuICBkb21haW46IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgTWV0YWxleFN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICByZWFkb25seSBkaXN0cmlidXRpb25Eb21haW5OYW1lOiBDZm5PdXRwdXQ7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgeyBkb21haW4sIC4uLnByb3BzIH06IE1ldGFsZXhTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBidWNrZXQgPSB0aGlzLnNldHVwV2Vic2l0ZUJ1Y2tldCgpO1xuXG4gICAgY29uc3QgY2VydCA9IHRoaXMuc2V0dXBDZXJ0aWZpY2F0aW9uKGRvbWFpbik7XG4gICAgXG4gICAgY29uc3Qgc3RhdGljV2Vic2l0ZVJlc3BvbnNlSGVhZGVyc1BvbGljeSA9IG5ldyBjbG91ZGZyb250LlJlc3BvbnNlSGVhZGVyc1BvbGljeSh0aGlzLCAnUmVzcG9uc2VIZWFkZXJzUG9saWN5Jywge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5TmFtZTogJ1N0YXRpY0RhdGFBcGlSZXNwb25zZUhlYWRlcnNQb2xpY3knLFxuICAgICAgY29yc0JlaGF2aW9yOiB7XG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd0NyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93SGVhZGVyczogQUxMT1dfSEVBREVSUyxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93TWV0aG9kczogWydHRVQnLCAnT1BUSU9OUyddLFxuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dPcmlnaW5zOiBBTExPV19PUklHSU5TLFxuICAgICAgICBhY2Nlc3NDb250cm9sTWF4QWdlOiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICAgIG9yaWdpbk92ZXJyaWRlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbW1vbkRpc3RyaWJ1dGlvbkJlaGF2aW9ycyA9IHtcbiAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICBjYWNoZWRNZXRob2RzOiBjbG91ZGZyb250LkNhY2hlZE1ldGhvZHMuQ0FDSEVfR0VUX0hFQURfT1BUSU9OUyxcbiAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5DT1JTX1MzX09SSUdJTixcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeTogc3RhdGljV2Vic2l0ZVJlc3BvbnNlSGVhZGVyc1BvbGljeSxcbiAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgIH07XG5cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ0FwaURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGNlcnRpZmljYXRlOiBjZXJ0LFxuICAgICAgZG9tYWluTmFtZXM6IFtkb21haW5dLFxuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oYnVja2V0KSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvKic6IHtcbiAgICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihidWNrZXQpLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXR1cFdlYnNpdGVTM1N0YXRpY0ZpbGVEZXBsb3koYnVja2V0LCBkaXN0cmlidXRpb24pO1xuXG4gICAgdGhpcy5kaXN0cmlidXRpb25Eb21haW5OYW1lID0gbmV3IENmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uRG9tYWluTmFtZScsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldHVwV2Vic2l0ZUJ1Y2tldCgpIHtcbiAgICByZXR1cm4gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnV2Vic2l0ZUJ1Y2tldCcsIHsgLi4uZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncygpIH0pO1xuICB9XG5cbiAgc2V0dXBDZXJ0aWZpY2F0aW9uKGRvbWFpbk5hbWU6IHN0cmluZykge1xuICAgIC8vIGlmIGRvbWFpbiBpcyBpbiByNTMsIHRoZSBkbnMgdmFsaWRhdGlvbnIgcmVjb3JkcyB3aWxsIGJlIGF1dG8gY3JlYXRlZFxuICAgIHJldHVybiBuZXcgYXdzX2NlcnRpZmljYXRlbWFuYWdlci5DZXJ0aWZpY2F0ZSh0aGlzLCAnQ2VydGlmaWNhdGUnLCB7XG4gICAgICBkb21haW5OYW1lLFxuICAgICAgdmFsaWRhdGlvbjogYXdzX2NlcnRpZmljYXRlbWFuYWdlci5DZXJ0aWZpY2F0ZVZhbGlkYXRpb24uZnJvbURucygpLCAvLyBSZWNvcmRzIG11c3QgYmUgYWRkZWQgbWFudWFsbHlcbiAgICB9KTtcbiAgfVxuXG4gIHNldHVwV2Vic2l0ZVMzU3RhdGljRmlsZURlcGxveShkZXN0aW5hdGlvbkJ1Y2tldDogczMuQnVja2V0LCBkaXN0cmlidXRpb246IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKSB7XG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1N0YXRpY1dlYnNpdGVGaWxlRGVwbG95Jywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldCgnLi9zdGF0aWMvd3d3JyldLFxuICAgICAgY2FjaGVDb250cm9sOiBbczNkZXBsb3kuQ2FjaGVDb250cm9sLnNldFB1YmxpYygpLCBzM2RlcGxveS5DYWNoZUNvbnRyb2wubWF4QWdlKER1cmF0aW9uLm1pbnV0ZXMoNSkpXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0LFxuICAgICAgZGVzdGluYXRpb25LZXlQcmVmaXg6ICcvJyxcbiAgICAgIGRpc3RyaWJ1dGlvbixcbiAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbJy8qJ10sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==