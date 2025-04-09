import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import App from "../src/App";

export function AppLog(props) {

  const auth = useAuth();
  const [initialState, setInitialState] = useState(0);
  const domain = window.location.hostname;

  const signOutRedirect = () => {
    const clientId = domain.includes('localhost') ? "5qrlet8e02f3fdnanhhdc6cav" : "5hulpf92bf14aevl7r8els5okp";
    const logoutUri = domain.includes('localhost') ? "http://localhost:5173" : "https://logit-app.pro/";
    const cognitoDomain = domain.includes('localhost') ? "https://c4ec69b5fbb16a799515.auth.us-east-1.amazoncognito.com" : "https://6abf3bd3517b8b0c5de5.auth.us-east-1.amazoncognito.com";
//    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    window.location.href = `${cognitoDomain}/logout?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(logoutUri)}&cope=openid+profile+aws.cognito.signin.user.admin`;
  };

  const logOut =async() => {
    setInitialState(1);
    if (auth.isAuthenticated) {
      await auth.removeUser();
    }
    signOutRedirect()
  }

  const signIn = async() => {
    await auth.signinRedirect();
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    signIn();
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <App userId={auth.user?.profile.email} onSubmitChange={logOut}/>
      </div>
    );
  }

  if (initialState == 0) {
    signIn();
  }

  return (
    <div>
    </div>
  );
}