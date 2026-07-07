#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CanopyStack } from '../lib/canopy-stack';

const app = new cdk.App();
new CanopyStack(app, 'CanopyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Canopy Project Management Application - Full Stack Serverless',
});
