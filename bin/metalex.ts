#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MetalexPipelineStack } from '../lib/metalex-pipeline-stack';

const app = new cdk.App();
new MetalexPipelineStack(app, 'MetalexPipelineStack', {
  env: { account: '904883826921', region: 'us-east-1' },
});
