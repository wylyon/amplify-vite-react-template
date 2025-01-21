import { env } from '$amplify/env/get-creds';

export const handler = async (event) => {
  const request = new Request(env.NAME, {
    headers: {
      AccessKeyId: `${env.API_ACCESS_KEY_ID}`,
      SecretAccess: `${env.API_SECRET_KEY}`,
      Region: `${env.API_REGION}`,
    }
  })
  return `${env.NAME}`;
};