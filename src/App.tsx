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

const client = generateClient<Schema>();

function App() {

  var disableMsg;
  var companyId = '';
  const [settings, setSettings] = useState<Schema["Settings"]["type"][]>([]);
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState(0);

  const getUser = async (userId) => {
    const { data: items, errors } = await client.models.user.list();
    if (items == null || items.length < 1) {
      return false;
    }
    const filterItems = items.filter(comp => comp.email_address.includes(userId));
    return (filterItems.length < 1) ? false : true;
  }

  const fetchAdmins = async (email) => {
    if (admin.length < 1) {
      return false;
    }
    const filterItems = admin.filter(comp => comp.email_address.includes(email));
    if (filterItems.length < 1 || !filterItems[0].active_date) {
      if (filterItems.length < 1) {
	// check if user is valid for input
	if (getUser(email)) {
	  setMode(1);
	  setIsSuperAdmin(false);
	  return false;
	}
      }
      disableMsg = "User is not Authorized for Access.";
      setIsDisabledUser(true);
      return true
    }
    if (!filterItems[0].company_id) {
      setIsSuperAdmin(true);
    }
    return false;
  };

  const getAdmins = async () => {
    const { data: items, errors } = await client.models.admin.list();
    setAdmin(items);
  }

  useEffect(() => {
    getAdmins();
    const sub = client.models.Settings.observeQuery().subscribe({
      next: (data) => setSettings([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function isAccessDisabled() {
    var isDisabled = false;
    {settings.map( setting => {isDisabled = setting.isDisabled; disableMsg = setting.content} )}
    return isDisabled;
  }

  function setDisabledFlag (userId) {
    setUserEmail(userId);
    return fetchAdmins(userId);
  }

  function nothingToDo() {
  }

  const filtered = admin.filter(comp => comp.email_address.includes(userEmail));

  return (
    isAccessDisabled() ? <DisableMode userId="Nobody" onSubmitChange={nothingToDo} message={disableMsg} /> :
    <Authenticator  hideSignUp socialProviders={['google']}>
      {({ signOut, user }) => (
        setDisabledFlag((user.signInDetails.loginId)) && isDisabledUser ? 
	(<DisableMode userId={user?.signInDetails?.loginId} onSubmitChange={signOut} message={disableMsg} />) :
        (mode < 1 ? <AdminMode userId={user?.signInDetails?.loginId} onSubmitChange={signOut} 
	companyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin} adminLength={admin.length}/> :
	<UserMode userId={user?.signInDetails?.loginId} onSubmitChange={signOut} />)
      )}
    </Authenticator>
  );
}

export default App;
