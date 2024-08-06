
// @ts-nocheck
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import ShowMenu from '../src/ShowMenu';

const client = generateClient<Schema>();

function App() {

  var disableMsg;
  var userEmail = '';
  var companyId = '';
  const [settings, setSettings] = useState<Schema["Settings"]["type"][]>([]);
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);

  const fetchAdmins = async () => {
    var isDisabled = true;
    const { data: items, errors } = await client.models.admin.list();
    setAdmin(items);
    for (let i = 0; i < items.length; i++) {
      if (items[i].email_address = userEmail && items[i].active_date) {
	if (!items[i].company_id) {
	  setIsSuperAdmin(true);
	} else {
	  companyId = items[i].company_id;
	}
	disableMsg = "";
	isDisabled = false;
	setIsDisabledUser(false);
      }
    }
    if (isDisabled) {
      disableMsg = "User is not Authorized for Access.";
      setIsDisabledUser(true);
    }  
};

  useEffect(() => {
    fetchAdmins();
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

  function deleteEnableDisableSetting(id: string) {
    client.models.Settings.delete({ id })
  }

  function setDisabledFlag (userId) {
    userEmail = userId;
  }

  function createDisableSetting() {
    {settings.map( setting => {deleteEnableDisableSetting(setting.id)} )}
    client.models.Settings.create({ content: "Site Down for Maintenance", isDisabled: true });
  }  

  function createEnableSetting() {
    {settings.map( setting => {deleteEnableDisableSetting(setting.id)} )}
    client.models.Settings.create({ content: "Site Down for Maintenance", isDisabled: false });
  }  

  const filtered = admin.filter(comp => comp.email_address.includes(userEmail));

  return (
    isAccessDisabled() ? <main><h1>Access Disabled : {disableMsg}</h1></main> :
    <Authenticator  hideSignUp socialProviders={['google']}>
      {({ signOut, user }) => (
        setDisabledFlag((user.signInDetails.loginId)) && isDisabledUser ? 
	<main><h1>Access Disabled : {disableMsg}</h1></main> :
      <main>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
	<div className="topnav">
  	  <a href="#home" class="active"><i className="fa fa-building" style={{fontSize:24}} />
	  {isSuperAdmin ? "Super Admin" : "Admin"}
	    <div className="rightText">
		({user?.signInDetails?.loginId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={signOut} />
	    </div>
	  </a>
	</div>
	<p className="gwd-p-1l8f">Log/Report Capture Tool</p>
	<ShowMenu selectedCompanyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin}/> 
      </main> 
      )}
    </Authenticator>
  );
}

export default App;
