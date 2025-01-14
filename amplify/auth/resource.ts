import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "LINK",
      verificationEmailSubject: "Invitation to Join LogIt Pro App",
      verificationEmailBody: (createLink) => 
        "You've been invited to join the LogIt Pro logging app by your admin and prompted to accept the invitation and create your account using the provided link: ${createLink('LogIt Pro Logging App')} .\n" +
        "Note:\n\nIf you have any questions, reach out to your company's Admin.\nAccept the invitation to join the logging app and create your account using the provided email address and Google SSO.",
    },
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email'],
        attributeMapping: {
          email: 'email'
        }
      },
      callbackUrls: [
        'http://localhost:5173',
        'https://main.dhhrhy5rbhj7h.amplifyapp.com/'
      ],
      logoutUrls: [
        'http://localhost:5173',
        'https://main.dhhrhy5rbhj7h.amplifyapp.com/'
      ]
    },
  },
});
