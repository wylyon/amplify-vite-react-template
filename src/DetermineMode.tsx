// @ts-nocheck
import * as React from 'react';
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import AdminMode from '../src/AdminMode';
import UserMode from '../src/UserMode';
import DisableMode from '../src/DisableMode';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { blue } from '@mui/material/colors';
import PopupWelcome from '../src/PopupWelcome';
import CircularProgress from '@mui/material/CircularProgress';

const client = generateClient<Schema>();

export default function DetermineMode(props) {

  const [filtered, setFiltered] = useState<Schema["admin"]["type"][]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');
  const [isWaiting, setIsWaiting] = useState(true);
  const [mode, setMode] = useState(9);

  function isMobile () {
    return (window.navigator.userAgent.match(/iPhone/i) || 
      window.navigator.userAgent.match(/iPad/i) ||
      window.navigator.userAgent.match(/Android/i)) ? true : false;
  }

  const fetchAdmins = (emailId, items, isValid, isRecycle) => {
    if (!isRecycle) {
      if (items.length < 1 || isSuperAdmin || mode != 9) {
        return false;
      }
    }
    const filterAdmin = items.filter(comp => comp.email_address.includes(emailId));
    if (filterAdmin == null || filterAdmin.length < 1 || !filterAdmin[0].active_date) {
      if (filterAdmin == null || filterAdmin.length < 1) {
	// check if user is valid for input
	      if (isValid) {
	        setMode(1);
//	        setIsSuperAdmin(false);
	        return false;
	      }
      }
      setMode(2);
    //  setWelcome(true);
      return true
    }
    if (!filterAdmin[0].company_id) {
      setIsSuperAdmin(true);
    }
    if (isValid) {
      // here we have an Admin who is also a template user
      // check screen size...if mobile then default to company user vs admin.
      if (isMobile()) {
        setMode(1);
 //       setIsSuperAdmin(false);
        return false;
      }
    }
    setMode(0);
    return false;
  };

  const allAdmins = async (isValid, userId) => {
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setIsWaiting(false);
      setDisableMsg("Cannot access Admins.");
      setIsDisabledUser(true);
    } else {
      setFiltered(items.filter(comp => comp.email_address.includes(props.userId)));
      fetchAdmins (userId, items, isValid, false);
      setIsWaiting(false);
    }
  }

  const allAdminsAfterWelcome = async (isValid, userId) => {
    setIsWaiting(true);
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setIsWaiting(false);
      setDisableMsg("Cannot access Admins.");
      setIsDisabledUser(true);
    } else {
      setFiltered(items.filter(comp => comp.email_address.includes(props.userId)));
      fetchAdmins (userId, items, isValid, true);
      setIsWaiting(false);
    }
  }

  useEffect(() => {

    async function getUser(userId) {
      const { data: items, errors } = await client.queries.listUserByEmail ({
        email: userId
      })
      if (errors) {
        alert(errors[0].message);
        setDisableMsg("Cannot access Users By Email.");
        setIsDisabledUser(true);
        allAdmins(false, userId);
      } else {
        if (items == null || items.length < 1) {
          allAdmins(false, userId);
        } else {
          allAdmins(true, userId);
        }
      }
    }

    getUser(props.userId);
  }, []);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleOnDone = (e) => {
    allAdminsAfterWelcome(true, props.userId);
  }

  const handleWelcomeClose = () => {
    setIsDisabledUser(true);
    setDisableMsg("User is not Authorized for Access.");
  }

  return (
    <>
    {isDisabledUser && <DisableMode userId={props.userId} onSubmitChange={handleOnCancel} message={disableMsg} /> }
    {!isDisabledUser && mode == 2 && <PopupWelcome userId={props.userId} companyName={props.companyName} onClose={handleWelcomeClose} onDone={handleOnDone} />}
    {!isDisabledUser && mode == 0 && <AdminMode userId={props.userId} googleAPI={props.googleAPI} onSubmitChange={handleOnCancel} 
	          companyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin} />}
    {!isDisabledUser && mode == 1 && <UserMode userId={props.userId} what3words={props.what3words} onSubmitChange={handleOnCancel} />}      
    {isWaiting && <CircularProgress />}  
    </>
  );
}
