// @ts-nocheck
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import AdminMode from '../src/AdminMode';
import UserMode from '../src/UserMode';
import DisableMode from '../src/DisableMode';
import DetermineMode from '../src/DetermineMode';

const client = generateClient<Schema>();

function App() {

  var companyId = '';
  const [settings, setSettings] = useState<Schema["Settings"]["type"][]>([]);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');

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

  useEffect(() => {
    fetchSettings();
  }, []);

  function nothingToDo() {
  }

  return (
    <>
    {isAccessDisabled && <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> }
    {!isAccessDisabled && <Authenticator >
      {({ signOut, user }) => (
        <DetermineMode userId={user.signInDetails.loginId} onSubmitChange={signOut}/>
      )}
    </Authenticator> }
    </>
  );
}

export default App;
