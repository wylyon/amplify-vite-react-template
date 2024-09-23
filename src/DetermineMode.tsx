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

export default function DetermineMode(props) {

  var companyId = '';
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState(9);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');

  const getUser = async (userId) => {
    const { data: items, errors } = await client.queries.listUserByEmail ({
      email: userId
    })
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Cannot access Users By Email.");
      setIsDisabledUser(true);
    } else {
      if (items == null || items.length < 1) {
        return false;
      }
      return true;
    }
  }
  const fetchAdmins = async (emailId, items) => {
    if (items.length < 1 || isSuperAdmin || mode != 9) {
      return false;
    }
    const filterAdmin = items.filter(comp => comp.email_address.includes(emailId));
    if (filterAdmin == null || filterAdmin.length < 1 || !filterAdmin[0].active_date) {
      if (filterAdmin == null || filterAdmin.length < 1) {
	// check if user is valid for input
	      if (getUser(emailId)) {
	        setMode(1);
	        setIsSuperAdmin(false);
	        return false;
	      }
      }
      disableMsg = "User is not Authorized for Access.";
      setIsDisabledUser(true);
      return true
    }
    if (!filterAdmin[0].company_id) {
      setIsSuperAdmin(true);
    }
    setMode(0);
    return false;
  };

  const allAdmins = async () => {
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Cannot access Admins.");
      setIsDisabledUser(true);
    } else {
      setAdmin(items);
      fetchAdmins (props.userId, items);
    }
  }

  useEffect(() => {
    setUserEmail(props.userId);
    allAdmins();
  }, []);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const filtered = admin.filter(comp => comp.email_address.includes(userEmail));

  return (
    <>
    {isDisabledUser && <DisableMode userId={props.userId} onSubmitChange={handleOnCancel} message={disableMsg} /> }
    {!isDisabledUser && mode == 0 && <AdminMode userId={props.userId} onSubmitChange={handleOnCancel} 
	          companyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin} adminLength={admin.length}/>}
    {!isDisabledUser && mode == 1 && <UserMode userId={props.userId} onSubmitChange={handleOnCancel} />}        
    </>
  );
}
