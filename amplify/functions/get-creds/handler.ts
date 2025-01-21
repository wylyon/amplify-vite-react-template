import { env } from '$amplify/env/get-creds';

export const handler = async () => {
  return {
    k: `${env.API_ACCESS_KEY_ID}`,
    s: `${env.API_SECRET_KEY}`,
    r: `${env.API_REGION}`,
  }
};