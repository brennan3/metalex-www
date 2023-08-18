import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_certificatemanager,
  CfnOutput,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

const ALLOW_ORIGINS = [
  'http://localhost:3000',
  'https://miladyandmilady.com',
  'https://www.miladyandmilady.com'
];

const ALLOW_HEADERS = ['Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Origin', 'authorization'];

const getDefaultBucketCorsSettings = () => ({
  cors: [
    {
      allowedMethods: [s3.HttpMethods.GET],
      allowedOrigins: ALLOW_ORIGINS,
      allowedHeaders: ALLOW_HEADERS,
    },
  ],
});

export interface MetalexStackProps extends StackProps {
  domainName: string,
  subjectAlternativeNames: string[]
}

export class MetalexStack extends Stack {
  readonly distributionDomainName: CfnOutput;

  constructor(scope: Construct, id: string, { domainName, subjectAlternativeNames, ...props }: MetalexStackProps) {
    super(scope, id, props);

    const bucket = this.setupWebsiteBucket();

    const cert = this.setupCertification(domainName, subjectAlternativeNames);
    
    const staticWebsiteResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
      responseHeadersPolicyName: 'StaticDataApiResponseHeadersPolicy',
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ALLOW_HEADERS,
        accessControlAllowMethods: ['GET', 'OPTIONS'],
        accessControlAllowOrigins: ALLOW_ORIGINS,
        accessControlMaxAge: Duration.seconds(300),
        originOverride: true,
      },
    });

    const commonDistributionBehaviors = {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
      responseHeadersPolicy: staticWebsiteResponseHeadersPolicy,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };

    const distribution = new cloudfront.Distribution(this, 'ApiDistribution', {
      certificate: cert,
      domainNames: [domainName, ...subjectAlternativeNames],
      defaultRootObject: 'index.html',
      defaultBehavior: {
        ...commonDistributionBehaviors,
        origin: new origins.S3Origin(bucket),
      },
      additionalBehaviors: {
        '/*': {
          ...commonDistributionBehaviors,
          origin: new origins.S3Origin(bucket),
        }
      },
    });

    this.setupWebsiteS3StaticFileDeploy(bucket, distribution);

    this.distributionDomainName = new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });
  }

  setupWebsiteBucket() {
    return new s3.Bucket(this, 'WebsiteBucket', { ...getDefaultBucketCorsSettings() });
  }

  setupCertification(domainName: string, subjectAlternativeNames: string[]) {
    // if domain is in r53, the dns validationr records will be auto created
    return new aws_certificatemanager.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: subjectAlternativeNames,
      validation: aws_certificatemanager.CertificateValidation.fromDns(), // Records must be added manually
    });
  }

  setupWebsiteS3StaticFileDeploy(destinationBucket: s3.Bucket, distribution: cloudfront.Distribution) {
    new s3deploy.BucketDeployment(this, 'StaticWebsiteFileDeploy', {
      sources: [s3deploy.Source.asset('./static/www')],
      cacheControl: [s3deploy.CacheControl.setPublic(), s3deploy.CacheControl.maxAge(Duration.minutes(5))],
      destinationBucket,
      destinationKeyPrefix: '/',
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
