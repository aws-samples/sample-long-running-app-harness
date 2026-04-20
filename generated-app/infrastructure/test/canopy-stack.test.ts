import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CanopyStack } from '../lib/canopy-stack';

describe('CanopyStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new CanopyStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    template = Template.fromStack(stack);
  });

  // ============================================================
  // DynamoDB Tests
  // ============================================================
  describe('DynamoDB', () => {
    test('creates a DynamoDB table with correct key schema', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'canopy-table',
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    test('DynamoDB table has three GSIs', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
          }),
          Match.objectLike({
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
          }),
          Match.objectLike({
            IndexName: 'GSI3',
            KeySchema: [
              { AttributeName: 'GSI3PK', KeyType: 'HASH' },
              { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
            ],
          }),
        ]),
      });
    });

    test('DynamoDB table has point-in-time recovery enabled', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });
  });

  // ============================================================
  // Lambda Tests
  // ============================================================
  describe('Lambda', () => {
    test('creates a Lambda function with Node.js 20 runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'canopy-api-handler',
        Runtime: 'nodejs20.x',
        MemorySize: 512,
        Timeout: 30,
      });
    });

    test('Lambda has TABLE_NAME environment variable', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  // ============================================================
  // API Gateway Tests
  // ============================================================
  describe('API Gateway', () => {
    test('creates an HTTP API', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        Name: 'canopy-api',
        ProtocolType: 'HTTP',
      });
    });

    test('API Gateway has CORS configured', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: Match.objectLike({
          AllowMethods: Match.arrayWith(['GET', 'POST', 'PUT', 'DELETE']),
          AllowHeaders: Match.arrayWith(['Content-Type', 'Authorization', 'X-Requested-With']),
        }),
      });
    });
  });

  // ============================================================
  // S3 + CloudFront Tests
  // ============================================================
  describe('S3 and CloudFront', () => {
    test('creates an S3 bucket for frontend', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('creates a CloudFront distribution', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
        }),
      });
    });

    test('CloudFront has SPA routing error responses', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          CustomErrorResponses: Match.arrayWith([
            Match.objectLike({
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
            }),
          ]),
        }),
      });
    });
  });

  // ============================================================
  // IAM Tests
  // ============================================================
  describe('IAM', () => {
    test('Lambda has DynamoDB read/write policy', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:BatchGetItem',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:BatchWriteItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
              ]),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });

  // ============================================================
  // Stack Outputs Tests
  // ============================================================
  describe('Stack Outputs', () => {
    test('exports ApiUrl', () => {
      template.hasOutput('ApiUrl', {
        Export: { Name: 'CanopyApiUrl' },
      });
    });

    test('exports FrontendBucketName', () => {
      template.hasOutput('FrontendBucketName', {
        Export: { Name: 'CanopyFrontendBucketName' },
      });
    });

    test('exports DistributionId', () => {
      template.hasOutput('DistributionId', {
        Export: { Name: 'CanopyDistributionId' },
      });
    });

    test('exports DistributionDomain', () => {
      template.hasOutput('DistributionDomain', {
        Export: { Name: 'CanopyDistributionDomain' },
      });
    });
  });

  // ============================================================
  // Snapshot Test (normalized to ignore S3Key hash changes from esbuild)
  // ============================================================
  test('matches snapshot', () => {
    const templateJson = template.toJSON();
    // Normalize S3Key hashes which change on every rebuild
    const normalized = JSON.parse(
      JSON.stringify(templateJson).replace(
        /"S3Key"\s*:\s*"[a-f0-9]{64}\.zip"/g,
        '"S3Key": "HASH_PLACEHOLDER.zip"'
      )
    );
    expect(normalized).toMatchSnapshot();
  });
});
