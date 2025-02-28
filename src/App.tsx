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

const client = generateClient<Schema>();

function App() {

  var companyId = '';
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  const fetchSettings = async () => {
    setIsWaiting(true);
    const { data: items, errors } = await client.models.Settings.list();
    if (errors) {
      alert(errors[0].message);
      setIsWaiting(false);
      setDisableMsg("Access is currently disabled.");
      setIsDisabledUser(true);
      setIsAccessDisabled(true);
    } else {
      setIsWaiting(false);
      if (items.length > 0) {
        setDisableMsg(items[0].content);
        setIsAccessDisabled (items[0].isDisabled);
      }
    }
  };

  const logOut = async() => {
    await signOut();
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function nothingToDo() {
  }

  return (
    <>
    {isAccessDisabled && <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> }
    {!isAccessDisabled && <Authenticator>
      {({ signOut, user }) => (
        !isWaiting && <DetermineMode userId={user.signInDetails.loginId} onSubmitChange={logOut} companyName={''} />
      )}
    </Authenticator> }
    {isWaiting && <CircularProgress />}
    </>
  );
}

export default App;
