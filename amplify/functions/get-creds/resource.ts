import { defineFunction, secret } from '@aws-amplify/backend';

export const getCreds = defineFunction({
  environment: {
    NAME: "AWS-Creds",
    API_ACCESS_KEY_ID: secret('ACCESS_KEY_ID'),
    API_SECRET_KEY: secret('SECRET_ACCESS_KEY'),
    API_REGION: secret('REGION'),
  },
  name: 'get-creds',
  entry: './handler.ts'
});