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
    constructor(scope, id, { domain, subjectAlternativeNames, ...props }) {
        super(scope, id, props);
        const bucket = this.setupWebsiteBucket();
        const cert = this.setupCertification(domain, subjectAlternativeNames);
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
            domainNames: [domain, ...subjectAlternativeNames],
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
    setupCertification(domainName, subjectAlternativeNames) {
        // if domain is in r53, the dns validationr records will be auto created
        return new aws_cdk_lib_1.aws_certificatemanager.Certificate(this, 'Certificate', {
            domainName,
            subjectAlternativeNames: subjectAlternativeNames,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBVXFCO0FBR3JCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLHVCQUF1QjtJQUN2Qiw2QkFBNkI7SUFDN0IsaUNBQWlDO0NBQ2xDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxDQUFDLGdDQUFnQyxFQUFFLCtCQUErQixFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUVySCxNQUFNLDRCQUE0QixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsSUFBSSxFQUFFO1FBQ0o7WUFDRSxjQUFjLEVBQUUsQ0FBQyxvQkFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFDcEMsY0FBYyxFQUFFLGFBQWE7WUFDN0IsY0FBYyxFQUFFLGFBQWE7U0FDOUI7S0FDRjtDQUNGLENBQUMsQ0FBQztBQU9ILE1BQWEsWUFBYSxTQUFRLG1CQUFLO0lBR3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxLQUFLLEVBQXFCO1FBQ3hHLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRXpDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUV0RSxNQUFNLGtDQUFrQyxHQUFHLElBQUksNEJBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDN0cseUJBQXlCLEVBQUUsb0NBQW9DO1lBQy9ELFlBQVksRUFBRTtnQkFDWiw2QkFBNkIsRUFBRSxLQUFLO2dCQUNwQyx5QkFBeUIsRUFBRSxhQUFhO2dCQUN4Qyx5QkFBeUIsRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7Z0JBQzdDLHlCQUF5QixFQUFFLGFBQWE7Z0JBQ3hDLG1CQUFtQixFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDMUMsY0FBYyxFQUFFLElBQUk7YUFDckI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLDJCQUEyQixHQUFHO1lBQ2xDLGNBQWMsRUFBRSw0QkFBVSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0I7WUFDaEUsYUFBYSxFQUFFLDRCQUFVLENBQUMsYUFBYSxDQUFDLHNCQUFzQjtZQUM5RCxtQkFBbUIsRUFBRSw0QkFBVSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7WUFDbEUscUJBQXFCLEVBQUUsa0NBQWtDO1lBQ3pELG9CQUFvQixFQUFFLDRCQUFVLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCO1NBQ3hFLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN4RSxXQUFXLEVBQUUsSUFBSTtZQUNqQixXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyx1QkFBdUIsQ0FBQztZQUNqRCxpQkFBaUIsRUFBRSxZQUFZO1lBQy9CLGVBQWUsRUFBRTtnQkFDZixHQUFHLDJCQUEyQjtnQkFDOUIsTUFBTSxFQUFFLElBQUksb0NBQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ3JDO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CLElBQUksRUFBRTtvQkFDSixHQUFHLDJCQUEyQjtvQkFDOUIsTUFBTSxFQUFFLElBQUksb0NBQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2lCQUNyQzthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUMxRSxLQUFLLEVBQUUsWUFBWSxDQUFDLHNCQUFzQjtTQUMzQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsR0FBRyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsa0JBQWtCLENBQUMsVUFBa0IsRUFBRSx1QkFBaUM7UUFDdEUsd0VBQXdFO1FBQ3hFLE9BQU8sSUFBSSxvQ0FBc0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqRSxVQUFVO1lBQ1YsdUJBQXVCLEVBQUUsdUJBQXVCO1lBQ2hELFVBQVUsRUFBRSxvQ0FBc0IsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxpQ0FBaUM7U0FDdEcsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDhCQUE4QixDQUFDLGlCQUE0QixFQUFFLFlBQXFDO1FBQ2hHLElBQUksK0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDN0QsT0FBTyxFQUFFLENBQUMsK0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2hELFlBQVksRUFBRSxDQUFDLCtCQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxFQUFFLCtCQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLGlCQUFpQjtZQUNqQixvQkFBb0IsRUFBRSxHQUFHO1lBQ3pCLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1RUQsb0NBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcbiAgYXdzX2Nsb3VkZnJvbnRfb3JpZ2lucyBhcyBvcmlnaW5zLFxuICBhd3NfczMgYXMgczMsXG4gIGF3c19zM19kZXBsb3ltZW50IGFzIHMzZGVwbG95LFxuICBhd3NfY2VydGlmaWNhdGVtYW5hZ2VyLFxuICBDZm5PdXRwdXQsXG4gIER1cmF0aW9uLFxuICBTdGFjayxcbiAgU3RhY2tQcm9wcyxcbn0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmNvbnN0IEFMTE9XX09SSUdJTlMgPSBbXG4gICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAnaHR0cHM6Ly9taWxhZHlhbmRtaWxhZHkuY29tJyxcbiAgJ2h0dHBzOi8vd3d3Lm1pbGFkeWFuZG1pbGFkeS5jb20nXG5dO1xuXG5jb25zdCBBTExPV19IRUFERVJTID0gWydBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnLCAnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1NZXRob2QnLCAnT3JpZ2luJywgJ2F1dGhvcml6YXRpb24nXTtcblxuY29uc3QgZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncyA9ICgpID0+ICh7XG4gIGNvcnM6IFtcbiAgICB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLkdFVF0sXG4gICAgICBhbGxvd2VkT3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBBTExPV19IRUFERVJTLFxuICAgIH0sXG4gIF0sXG59KTtcblxuZXhwb3J0IGludGVyZmFjZSBNZXRhbGV4U3RhY2tQcm9wcyBleHRlbmRzIFN0YWNrUHJvcHMge1xuICBkb21haW46IHN0cmluZyxcbiAgc3ViamVjdEFsdGVybmF0aXZlTmFtZXM6IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBjbGFzcyBNZXRhbGV4U3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHJlYWRvbmx5IGRpc3RyaWJ1dGlvbkRvbWFpbk5hbWU6IENmbk91dHB1dDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCB7IGRvbWFpbiwgc3ViamVjdEFsdGVybmF0aXZlTmFtZXMsIC4uLnByb3BzIH06IE1ldGFsZXhTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBidWNrZXQgPSB0aGlzLnNldHVwV2Vic2l0ZUJ1Y2tldCgpO1xuXG4gICAgY29uc3QgY2VydCA9IHRoaXMuc2V0dXBDZXJ0aWZpY2F0aW9uKGRvbWFpbiwgc3ViamVjdEFsdGVybmF0aXZlTmFtZXMpO1xuICAgIFxuICAgIGNvbnN0IHN0YXRpY1dlYnNpdGVSZXNwb25zZUhlYWRlcnNQb2xpY3kgPSBuZXcgY2xvdWRmcm9udC5SZXNwb25zZUhlYWRlcnNQb2xpY3kodGhpcywgJ1Jlc3BvbnNlSGVhZGVyc1BvbGljeScsIHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeU5hbWU6ICdTdGF0aWNEYXRhQXBpUmVzcG9uc2VIZWFkZXJzUG9saWN5JyxcbiAgICAgIGNvcnNCZWhhdmlvcjoge1xuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd0hlYWRlcnM6IEFMTE9XX0hFQURFUlMsXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd01ldGhvZHM6IFsnR0VUJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93T3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgICAgYWNjZXNzQ29udHJvbE1heEFnZTogRHVyYXRpb24uc2Vjb25kcygzMDApLFxuICAgICAgICBvcmlnaW5PdmVycmlkZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMgPSB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgY2FjaGVkTWV0aG9kczogY2xvdWRmcm9udC5DYWNoZWRNZXRob2RzLkNBQ0hFX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQ09SU19TM19PUklHSU4sXG4gICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3k6IHN0YXRpY1dlYnNpdGVSZXNwb25zZUhlYWRlcnNQb2xpY3ksXG4gICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICB9O1xuXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdBcGlEaXN0cmlidXRpb24nLCB7XG4gICAgICBjZXJ0aWZpY2F0ZTogY2VydCxcbiAgICAgIGRvbWFpbk5hbWVzOiBbZG9tYWluLCAuLi5zdWJqZWN0QWx0ZXJuYXRpdmVOYW1lc10sXG4gICAgICBkZWZhdWx0Um9vdE9iamVjdDogJ2luZGV4Lmh0bWwnLFxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIC4uLmNvbW1vbkRpc3RyaWJ1dGlvbkJlaGF2aW9ycyxcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihidWNrZXQpLFxuICAgICAgfSxcbiAgICAgIGFkZGl0aW9uYWxCZWhhdmlvcnM6IHtcbiAgICAgICAgJy8qJzoge1xuICAgICAgICAgIC4uLmNvbW1vbkRpc3RyaWJ1dGlvbkJlaGF2aW9ycyxcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKGJ1Y2tldCksXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLnNldHVwV2Vic2l0ZVMzU3RhdGljRmlsZURlcGxveShidWNrZXQsIGRpc3RyaWJ1dGlvbik7XG5cbiAgICB0aGlzLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUgPSBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdEaXN0cmlidXRpb25Eb21haW5OYW1lJywge1xuICAgICAgdmFsdWU6IGRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0dXBXZWJzaXRlQnVja2V0KCkge1xuICAgIHJldHVybiBuZXcgczMuQnVja2V0KHRoaXMsICdXZWJzaXRlQnVja2V0JywgeyAuLi5nZXREZWZhdWx0QnVja2V0Q29yc1NldHRpbmdzKCkgfSk7XG4gIH1cblxuICBzZXR1cENlcnRpZmljYXRpb24oZG9tYWluTmFtZTogc3RyaW5nLCBzdWJqZWN0QWx0ZXJuYXRpdmVOYW1lczogc3RyaW5nW10pIHtcbiAgICAvLyBpZiBkb21haW4gaXMgaW4gcjUzLCB0aGUgZG5zIHZhbGlkYXRpb25yIHJlY29yZHMgd2lsbCBiZSBhdXRvIGNyZWF0ZWRcbiAgICByZXR1cm4gbmV3IGF3c19jZXJ0aWZpY2F0ZW1hbmFnZXIuQ2VydGlmaWNhdGUodGhpcywgJ0NlcnRpZmljYXRlJywge1xuICAgICAgZG9tYWluTmFtZSxcbiAgICAgIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBzdWJqZWN0QWx0ZXJuYXRpdmVOYW1lcyxcbiAgICAgIHZhbGlkYXRpb246IGF3c19jZXJ0aWZpY2F0ZW1hbmFnZXIuQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoKSwgLy8gUmVjb3JkcyBtdXN0IGJlIGFkZGVkIG1hbnVhbGx5XG4gICAgfSk7XG4gIH1cblxuICBzZXR1cFdlYnNpdGVTM1N0YXRpY0ZpbGVEZXBsb3koZGVzdGluYXRpb25CdWNrZXQ6IHMzLkJ1Y2tldCwgZGlzdHJpYnV0aW9uOiBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbikge1xuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdTdGF0aWNXZWJzaXRlRmlsZURlcGxveScsIHtcbiAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoJy4vc3RhdGljL3d3dycpXSxcbiAgICAgIGNhY2hlQ29udHJvbDogW3MzZGVwbG95LkNhY2hlQ29udHJvbC5zZXRQdWJsaWMoKSwgczNkZXBsb3kuQ2FjaGVDb250cm9sLm1heEFnZShEdXJhdGlvbi5taW51dGVzKDUpKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldCxcbiAgICAgIGRlc3RpbmF0aW9uS2V5UHJlZml4OiAnLycsXG4gICAgICBkaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuICAgIH0pO1xuICB9XG59XG4iXX0=