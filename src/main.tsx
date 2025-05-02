import React from "react";
import ReactDOM from "react-dom/client";
import { AppLog } from "../src/AppLog.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { AuthProvider } from "react-oidc-context";

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API
  },
});

const domain = window.location.hostname;

const cognitoAuthConfigProd = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_aNDjqQEqZ",
  client_id: "5hulpf92bf14aevl7r8els5okp",
  redirect_uri: "https://logit-app.pro/",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
};

const cognitoAuthConfigDev = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Bswg2SNyW",
  client_id: "4789a9o8cq28u84qfvbhofcbo6",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...domain.includes('localhost') ? cognitoAuthConfigDev : cognitoAuthConfigProd}>
      <AppLog />
    </AuthProvider>
  </React.StrictMode>
);