// @ts-nocheck
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Authenticator, Input, TextField, useAuthenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import AdminMode from '../src/AdminMode';
import UserMode from '../src/UserMode';
import DisableMode from '../src/DisableMode';
import DetermineMode from '../src/DetermineMode';
import { signOut } from 'aws-amplify/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';
import CircularProgress from '@mui/material/CircularProgress';
import { clearState } from '../src/utils.js';

const client = generateClient<Schema>();

var googleAPIKeyValue;
var what3wordAPIValue;

const fetchSettings = async () => {

  const { data: items, errors } = await client.models.Settings.list();
  if (errors) {
    return {
      data: null,
      googleAPIKey: null,
      what3wordAPI: null,
      errors
    };
  }
  const { data: appSettings, errors: appErrors } = await client.models.app_settings.list();
  if (appErrors) {
    return {
      data: null,
      googleAPIKey: null,
      what3wordAPI: null,
      errors: appErrors
    };
  }
  // plumb in our responses
  const googleAPI = appSettings.filter(map => map.code.includes('GOOGLE_MAP_API_KEY'));
  const what3wordsAPI = appSettings.filter(map => map.code == 'WHAT3WORDS_API_KEY');
  return {
    data: items,
    googleAPIKey: googleAPI[0].value,
    what3wordAPI: what3wordsAPI == null || what3wordsAPI.length < 1 ? null : what3wordsAPI[0].value,
    errors
  }
}

function App() {

  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);
  const [emailAddress, setEmailAddress] = useState(null);
  const [reload, setReload] = useState(false);

  const checkSettings = async (items, errors, googleAPIKey, what3wordAPI) => {
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Access is currently disabled.");
      setIsDisabledUser(true);
      setIsAccessDisabled(true);
      setIsWaiting(false);
    } else {
      if (items.length > 0) {
        setDisableMsg(items[0].content);
        setIsAccessDisabled (items[0].isDisabled);
        setIsWaiting(false);
      } else {
        googleAPIKeyValue = googleAPIKey;
        what3wordAPIValue = what3wordAPI;
        setIsWaiting(false);
      }
    }
  };

  const logOut = async() => {
    clearState();
    await signOut();
    setReload(true);
  }

  const fetchEmail = async () => {
    if (emailAddress) {
      return;
    }
    try {
      const { email} = await fetchUserAttributes();
      setEmailAddress(email);
    } catch (exception) {

    }
  }

  useEffect(() => {
    if (reload) {
      window.location.reload();
      }
    const fetchTheSettings = async () => {
      const {data: items, googleAPIKey, what3wordAPI, errors} = await fetchSettings();
      checkSettings(items, errors, googleAPIKey, what3wordAPI);
    }
//    setIsWaiting(true);
    fetchTheSettings();
  }, [reload]);

  function nothingToDo() {
  }

  return (
    <>
    {isAccessDisabled && <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> }
    {emailAddress && <DetermineMode userId={emailAddress} googleAPI={googleAPIKeyValue} what3words={what3wordAPIValue} onSubmitChange={logOut} companyName={''} />}
    {!isAccessDisabled && <Authenticator>
      {({ signOut, user }) => {
        if (user.signInDetails === undefined || user.signInDetails.loginId === undefined ) {
          fetchEmail();
        } else {
          setEmailAddress(user.signInDetails.loginId);
        }
      }}
    </Authenticator> }
    {isWaiting && <CircularProgress />}
    </>
  );
}

export default App;
