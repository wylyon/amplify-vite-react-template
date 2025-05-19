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
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_9qocj7aN7",
  client_id: "frauuuf4llf4fdkkd0ae1g46g",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
    <AuthProvider {...domain.includes('localhost') ? cognitoAuthConfigDev : cognitoAuthConfigProd}>
      <AppLog />
    </AuthProvider>
);