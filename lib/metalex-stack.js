"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalexStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ALLOW_ORIGINS = [
    'http://localhost:3000',
    'https://miladyandmilady.com',
    'https://www.miladyandmilady.com',
    'https://miladyandmilady.dev',
    'https://www.miladyandmilady.dev',
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
    constructor(scope, id, { domainName, subjectAlternativeNames, ...props }) {
        super(scope, id, props);
        const bucket = this.setupWebsiteBucket();
        const cert = this.setupCertification(domainName, subjectAlternativeNames);
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
            domainNames: [domainName, ...subjectAlternativeNames],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWxleC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFsZXgtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBVXFCO0FBR3JCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLHVCQUF1QjtJQUN2Qiw2QkFBNkI7SUFDN0IsaUNBQWlDO0lBQ2pDLDZCQUE2QjtJQUM3QixpQ0FBaUM7Q0FDbEMsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsK0JBQStCLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRXJILE1BQU0sNEJBQTRCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxQyxJQUFJLEVBQUU7UUFDSjtZQUNFLGNBQWMsRUFBRSxDQUFDLG9CQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUNwQyxjQUFjLEVBQUUsYUFBYTtZQUM3QixjQUFjLEVBQUUsYUFBYTtTQUM5QjtLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBT0gsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFHckMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBRSxHQUFHLEtBQUssRUFBcUI7UUFDNUcsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBRTFFLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSw0QkFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUM3Ryx5QkFBeUIsRUFBRSxvQ0FBb0M7WUFDL0QsWUFBWSxFQUFFO2dCQUNaLDZCQUE2QixFQUFFLEtBQUs7Z0JBQ3BDLHlCQUF5QixFQUFFLGFBQWE7Z0JBQ3hDLHlCQUF5QixFQUFFLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztnQkFDN0MseUJBQXlCLEVBQUUsYUFBYTtnQkFDeEMsbUJBQW1CLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUMxQyxjQUFjLEVBQUUsSUFBSTthQUNyQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sMkJBQTJCLEdBQUc7WUFDbEMsY0FBYyxFQUFFLDRCQUFVLENBQUMsY0FBYyxDQUFDLHNCQUFzQjtZQUNoRSxhQUFhLEVBQUUsNEJBQVUsQ0FBQyxhQUFhLENBQUMsc0JBQXNCO1lBQzlELG1CQUFtQixFQUFFLDRCQUFVLENBQUMsbUJBQW1CLENBQUMsY0FBYztZQUNsRSxxQkFBcUIsRUFBRSxrQ0FBa0M7WUFDekQsb0JBQW9CLEVBQUUsNEJBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUI7U0FDeEUsQ0FBQztRQUVGLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3hFLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxHQUFHLHVCQUF1QixDQUFDO1lBQ3JELGlCQUFpQixFQUFFLFlBQVk7WUFDL0IsZUFBZSxFQUFFO2dCQUNmLEdBQUcsMkJBQTJCO2dCQUM5QixNQUFNLEVBQUUsSUFBSSxvQ0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDckM7WUFDRCxtQkFBbUIsRUFBRTtnQkFDbkIsSUFBSSxFQUFFO29CQUNKLEdBQUcsMkJBQTJCO29CQUM5QixNQUFNLEVBQUUsSUFBSSxvQ0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7aUJBQ3JDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEJBQThCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzFFLEtBQUssRUFBRSxZQUFZLENBQUMsc0JBQXNCO1NBQzNDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRSxHQUFHLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxVQUFrQixFQUFFLHVCQUFpQztRQUN0RSx3RUFBd0U7UUFDeEUsT0FBTyxJQUFJLG9DQUFzQixDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2pFLFVBQVU7WUFDVix1QkFBdUIsRUFBRSx1QkFBdUI7WUFDaEQsVUFBVSxFQUFFLG9DQUFzQixDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxFQUFFLGlDQUFpQztTQUN0RyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsOEJBQThCLENBQUMsaUJBQTRCLEVBQUUsWUFBcUM7UUFDaEcsSUFBSSwrQkFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUM3RCxPQUFPLEVBQUUsQ0FBQywrQkFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDaEQsWUFBWSxFQUFFLENBQUMsK0JBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUUsK0JBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLHNCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEcsaUJBQWlCO1lBQ2pCLG9CQUFvQixFQUFFLEdBQUc7WUFDekIsWUFBWTtZQUNaLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDO1NBQzFCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVFRCxvQ0E0RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhd3NfY2xvdWRmcm9udCBhcyBjbG91ZGZyb250LFxuICBhd3NfY2xvdWRmcm9udF9vcmlnaW5zIGFzIG9yaWdpbnMsXG4gIGF3c19zMyBhcyBzMyxcbiAgYXdzX3MzX2RlcGxveW1lbnQgYXMgczNkZXBsb3ksXG4gIGF3c19jZXJ0aWZpY2F0ZW1hbmFnZXIsXG4gIENmbk91dHB1dCxcbiAgRHVyYXRpb24sXG4gIFN0YWNrLFxuICBTdGFja1Byb3BzLFxufSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuY29uc3QgQUxMT1dfT1JJR0lOUyA9IFtcbiAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICdodHRwczovL21pbGFkeWFuZG1pbGFkeS5jb20nLFxuICAnaHR0cHM6Ly93d3cubWlsYWR5YW5kbWlsYWR5LmNvbScsXG4gICdodHRwczovL21pbGFkeWFuZG1pbGFkeS5kZXYnLFxuICAnaHR0cHM6Ly93d3cubWlsYWR5YW5kbWlsYWR5LmRldicsXG5dO1xuXG5jb25zdCBBTExPV19IRUFERVJTID0gWydBY2Nlc3MtQ29udHJvbC1SZXF1ZXN0LUhlYWRlcnMnLCAnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1NZXRob2QnLCAnT3JpZ2luJywgJ2F1dGhvcml6YXRpb24nXTtcblxuY29uc3QgZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncyA9ICgpID0+ICh7XG4gIGNvcnM6IFtcbiAgICB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogW3MzLkh0dHBNZXRob2RzLkdFVF0sXG4gICAgICBhbGxvd2VkT3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBBTExPV19IRUFERVJTLFxuICAgIH0sXG4gIF0sXG59KTtcblxuZXhwb3J0IGludGVyZmFjZSBNZXRhbGV4U3RhY2tQcm9wcyBleHRlbmRzIFN0YWNrUHJvcHMge1xuICBkb21haW5OYW1lOiBzdHJpbmcsXG4gIHN1YmplY3RBbHRlcm5hdGl2ZU5hbWVzOiBzdHJpbmdbXVxufVxuXG5leHBvcnQgY2xhc3MgTWV0YWxleFN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICByZWFkb25seSBkaXN0cmlidXRpb25Eb21haW5OYW1lOiBDZm5PdXRwdXQ7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgeyBkb21haW5OYW1lLCBzdWJqZWN0QWx0ZXJuYXRpdmVOYW1lcywgLi4ucHJvcHMgfTogTWV0YWxleFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMuc2V0dXBXZWJzaXRlQnVja2V0KCk7XG5cbiAgICBjb25zdCBjZXJ0ID0gdGhpcy5zZXR1cENlcnRpZmljYXRpb24oZG9tYWluTmFtZSwgc3ViamVjdEFsdGVybmF0aXZlTmFtZXMpO1xuICAgIFxuICAgIGNvbnN0IHN0YXRpY1dlYnNpdGVSZXNwb25zZUhlYWRlcnNQb2xpY3kgPSBuZXcgY2xvdWRmcm9udC5SZXNwb25zZUhlYWRlcnNQb2xpY3kodGhpcywgJ1Jlc3BvbnNlSGVhZGVyc1BvbGljeScsIHtcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeU5hbWU6ICdTdGF0aWNEYXRhQXBpUmVzcG9uc2VIZWFkZXJzUG9saWN5JyxcbiAgICAgIGNvcnNCZWhhdmlvcjoge1xuICAgICAgICBhY2Nlc3NDb250cm9sQWxsb3dDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd0hlYWRlcnM6IEFMTE9XX0hFQURFUlMsXG4gICAgICAgIGFjY2Vzc0NvbnRyb2xBbGxvd01ldGhvZHM6IFsnR0VUJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWNjZXNzQ29udHJvbEFsbG93T3JpZ2luczogQUxMT1dfT1JJR0lOUyxcbiAgICAgICAgYWNjZXNzQ29udHJvbE1heEFnZTogRHVyYXRpb24uc2Vjb25kcygzMDApLFxuICAgICAgICBvcmlnaW5PdmVycmlkZTogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMgPSB7XG4gICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgY2FjaGVkTWV0aG9kczogY2xvdWRmcm9udC5DYWNoZWRNZXRob2RzLkNBQ0hFX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQ09SU19TM19PUklHSU4sXG4gICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3k6IHN0YXRpY1dlYnNpdGVSZXNwb25zZUhlYWRlcnNQb2xpY3ksXG4gICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICB9O1xuXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdBcGlEaXN0cmlidXRpb24nLCB7XG4gICAgICBjZXJ0aWZpY2F0ZTogY2VydCxcbiAgICAgIGRvbWFpbk5hbWVzOiBbZG9tYWluTmFtZSwgLi4uc3ViamVjdEFsdGVybmF0aXZlTmFtZXNdLFxuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oYnVja2V0KSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvKic6IHtcbiAgICAgICAgICAuLi5jb21tb25EaXN0cmlidXRpb25CZWhhdmlvcnMsXG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihidWNrZXQpLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXR1cFdlYnNpdGVTM1N0YXRpY0ZpbGVEZXBsb3koYnVja2V0LCBkaXN0cmlidXRpb24pO1xuXG4gICAgdGhpcy5kaXN0cmlidXRpb25Eb21haW5OYW1lID0gbmV3IENmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uRG9tYWluTmFtZScsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldHVwV2Vic2l0ZUJ1Y2tldCgpIHtcbiAgICByZXR1cm4gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnV2Vic2l0ZUJ1Y2tldCcsIHsgLi4uZ2V0RGVmYXVsdEJ1Y2tldENvcnNTZXR0aW5ncygpIH0pO1xuICB9XG5cbiAgc2V0dXBDZXJ0aWZpY2F0aW9uKGRvbWFpbk5hbWU6IHN0cmluZywgc3ViamVjdEFsdGVybmF0aXZlTmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgLy8gaWYgZG9tYWluIGlzIGluIHI1MywgdGhlIGRucyB2YWxpZGF0aW9uciByZWNvcmRzIHdpbGwgYmUgYXV0byBjcmVhdGVkXG4gICAgcmV0dXJuIG5ldyBhd3NfY2VydGlmaWNhdGVtYW5hZ2VyLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgIGRvbWFpbk5hbWUsXG4gICAgICBzdWJqZWN0QWx0ZXJuYXRpdmVOYW1lczogc3ViamVjdEFsdGVybmF0aXZlTmFtZXMsXG4gICAgICB2YWxpZGF0aW9uOiBhd3NfY2VydGlmaWNhdGVtYW5hZ2VyLkNlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKCksIC8vIFJlY29yZHMgbXVzdCBiZSBhZGRlZCBtYW51YWxseVxuICAgIH0pO1xuICB9XG5cbiAgc2V0dXBXZWJzaXRlUzNTdGF0aWNGaWxlRGVwbG95KGRlc3RpbmF0aW9uQnVja2V0OiBzMy5CdWNrZXQsIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udC5EaXN0cmlidXRpb24pIHtcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnU3RhdGljV2Vic2l0ZUZpbGVEZXBsb3knLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KCcuL3N0YXRpYy93d3cnKV0sXG4gICAgICBjYWNoZUNvbnRyb2w6IFtzM2RlcGxveS5DYWNoZUNvbnRyb2wuc2V0UHVibGljKCksIHMzZGVwbG95LkNhY2hlQ29udHJvbC5tYXhBZ2UoRHVyYXRpb24ubWludXRlcyg1KSldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQsXG4gICAgICBkZXN0aW5hdGlvbktleVByZWZpeDogJy8nLFxuICAgICAgZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcbiAgfVxufVxuIl19