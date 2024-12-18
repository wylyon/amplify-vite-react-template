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

const client = generateClient<Schema>();

function App() {

  var companyId = '';
  const [settings, setSettings] = useState<Schema["Settings"]["type"][]>([]);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');
  const [loginId, setLoginId] = useState('');
  const [companyName, setCompanyName] = useState('');

  const fetchSettings = async () => {
    const { data: items, errors } = await client.models.Settings.list();
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Access is currently disabled.");
      setIsDisabledUser(true);
      setIsAccessDisabled(true);
    } else {
      if (items.length > 0) {
        setDisableMsg(items[0].content);
        setIsAccessDisabled (items[0].isDisabled);
      }
    }
  };

  const fetchLogin = async () => {
    const { email } = await fetchUserAttributes();
    setLoginId(email);
    return email;
  }

  const logOut = async() => {
    await signOut();
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function nothingToDo() {
  }

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
  }

  return (
    <>
    {isAccessDisabled && <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> }
    {!isAccessDisabled && <Authenticator 
      components={{
        SignUp: {
          FormFields() {
            const { validationErrors } = useAuthenticator();
            return (
              <>
              <Authenticator.SignUp.FormFields />
              <TextField name="company" label="Company (or Name)" type="text" onBlur={handleCompanyName}/>
              </>
            )
          }
        }
      }}
    >
      {({ signOut, user }) => (
        fetchLogin() && loginId != '' && <DetermineMode userId={loginId} onSubmitChange={signOut} companyName={companyName} />
      )}
    </Authenticator> }
    </>
  );
}

export default App;
