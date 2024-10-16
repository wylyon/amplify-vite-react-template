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
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState(0);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');

  const getUser = async (userId) => {
    const { data: items, errors } = await client.queries.listUserByEmail ({
      email: userId
    })
    if (items == null || items.length < 1) {
      return false;
    }
    return true;
  }
  const allAdmins = async () => {
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Access is currently disabled.");
      setIsDisabledUser(true);
      setIsAccessDisabled(true);
    } else {
      setAdmin(items);
    }
  }

  const fetchAdmins = async (emailId) => {
    if (admin.length < 1 || isSuperAdmin || mode > 0) {
      return false;
    }
    const filterAdmin = admin.filter(comp => comp.email_address.includes(emailId));
    if (filterAdmin == null || filterAdmin.length < 1 || !filterAdmin[0].active_date) {
      if (filterAdmin == null || filterAdmin.length < 1) {
	// check if user is valid for input
	      if (getUser(emailId)) {
	        setMode(1);
	        setIsSuperAdmin(false);
	        return false;
	      }
      }
      setDisableMsg("User is not Authorized for Access.");
      setIsDisabledUser(true);
      return true
    }
    if (!filterAdmin[0].company_id) {
      setIsSuperAdmin(true);
    }
    return false;
  };

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
    allAdmins();
    fetchSettings();
  }, []);

  function setDisabledFlag (userId) {
    setUserEmail(userId);
    return fetchAdmins(userId);
  }

  function nothingToDo() {
  }

  const filtered = admin.filter(comp => comp.email_address.includes(userEmail));

  return (
    <>
    {isAccessDisabled && <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> }
    {!isAccessDisabled && <Authenticator  hideSignUp >
      {({ signOut, user }) => (
        <DetermineMode userId={user.signInDetails.loginId} onSubmitChange={signOut}/>
      )}
    </Authenticator> }
    </>
  );
}

export default App;
