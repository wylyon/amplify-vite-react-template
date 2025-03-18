import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      userInvitation: {
        emailSubject: "Invitation to Join LogIt Pro App.   Please SignIn with this Temporary Password",
        emailBody: (username, code) => `You have been invited to join the LogIt Pro logging app by your admin and prompted to accept the invitation and create your account, by going to https://logit-app.pro/ with email ${username()} and temporary password is ${code()}.<br/>` +
          "Note:<br/><li>If you have any questions, reach out to your company's Admin.</li><br/><li>Accept the invitation to join the logging app and create your account using the provided email address and Google SSO.</li>",
      },
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Invitation to Join LogIt Pro App",
      verificationEmailBody: (createCode) => 
          `You have been invited to join the LogIt Pro logging app by your admin and prompted to accept the invitation and create your account, by going to https://logit-app.pro/ with verification code ${createCode()}.<br/>` +
        "Note:<br/><li>If you have any questions, reach out to your company's Admin.</li><br/><li>Accept the invitation to join the logging app and create your account using the provided email address and Google SSO.</li>",
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
        'https://main.dhhrhy5rbhj7h.amplifyapp.com/',
        'https://logit-app.pro/'
      ],
      logoutUrls: [
        'http://localhost:5173',
        'https://main.dhhrhy5rbhj7h.amplifyapp.com/',
        'https://logit-app.pro/'
      ]
    },
  },
});
