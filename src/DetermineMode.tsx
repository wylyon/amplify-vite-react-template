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

const client = generateClient<Schema>();

export default function DetermineMode(props) {

  var companyId = '';
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [filtered, setFiltered] = useState<Schema["admin"]["type"][]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDisabledUser, setIsDisabledUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState(9);
  const [isAccessDisabled, setIsAccessDisabled] = useState(false);
  const [disableMsg, setDisableMsg] = useState('');
  const [open, setOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const [googleAPIKey, setGoogleAPIKey] = useState('');
  const [what3WordsAPIKey, setWhat3WordsAPIKey] = useState('');

  function isMobile () {
    return (window.navigator.userAgent.match(/iPhone/i) || 
      window.navigator.userAgent.match(/iPad/i) ||
      window.navigator.userAgent.match(/Android/i)) ? true : false;
  }

  const getAppSettings = async() => {
    const { data: items, errors } = await client.models.app_settings.list();
    if (errors) {
      alert(errors[0].message);
    } else {
      const googleAPI = items.filter(map => map.code.includes('GOOGLE_MAP_API_KEY'));
      setGoogleAPIKey(googleAPI[0].value);
      const what3wordsAPI = items.filter(map => map.code == 'WHAT3WORDS_API_KEY');
      setWhat3WordsAPIKey(what3wordsAPI == null || what3wordsAPI.length < 1 ? null : what3wordsAPI[0].value);
    }
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
	        setIsSuperAdmin(false);
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
        setIsSuperAdmin(false);
        return false;
      }
    }
    if (isMobile()) {
      setOpen(true);
    } 
    setMode(0);
    return false;
  };

  const allAdmins = async (isValid, userId) => {
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Cannot access Admins.");
      setIsDisabledUser(true);
    } else {
      setFiltered(items.filter(comp => comp.email_address.includes(props.userId)));
      setAdmin(items);
      fetchAdmins (userId, items, isValid, false);
    }
  }

  const allAdminsAfterWelcome = async (isValid, userId) => {
    const { data: items, errors } = await client.models.admin.list();
    if (errors) {
      alert(errors[0].message);
      setDisableMsg("Cannot access Admins.");
      setIsDisabledUser(true);
    } else {
      setFiltered(items.filter(comp => comp.email_address.includes(props.userId)));
      setAdmin(items);
      fetchAdmins (userId, items, isValid, true);
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
        setIsValidUser(false);
        allAdmins(false, userId);
      } else {
        if (items == null || items.length < 1) {
          setIsValidUser(false);
          allAdmins(false, userId);
        } else {
          setIsValidUser(true);
          allAdmins(true, userId);
        }
      }
    }

    getAppSettings();
    setUserEmail(props.userId);
    getUser(props.userId);
  }, []);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleOnDone = (e) => {
    setIsValidUser(true);
    allAdminsAfterWelcome(true, props.userId);
  }

  const handleSuperClose = () => {
    setOpen(false);
  };

  const handleWelcomeClose = () => {
    setWelcome(false);
    setIsDisabledUser(true);
    setDisableMsg("User is not Authorized for Access.");
  }

  const handleListItemClick = (value: string) => {
    setOpen(false);
    setWelcome(false);
    if (value == "info") {
      window.location.href = 'https://logit.pro';
    } else if (value == "login") {
      props.onSubmitChange(false);
    } else if (value == "exit") {
      handleWelcomeClose;
    } else if (value == "welcome") {
      setMode(2);
    } else if (value == "admin") {
      setMode(0);
    } else {
      setMode(1);
      setIsSuperAdmin(false);
    }
  };

  return (
    <>
    <Dialog onClose={handleSuperClose} open={open && isValidUser}>
      <DialogTitle>Which Access?</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem disableGutters key="super">
          <ListItemButton onClick={() => handleListItemClick("admin")}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Admin" />
          </ListItemButton>         
        </ListItem>
        <ListItem disableGutters key="regular">
          <ListItemButton onClick={() => handleListItemClick("regular")}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Data Input" />
          </ListItemButton>         
        </ListItem>
      </List>
    </Dialog>
    <Dialog onClose={handleWelcomeClose} open={welcome && !isValidUser}>
      <DialogTitle>Invalid Login or New User</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem disableGutters key="welcome">
          <ListItemButton onClick={() => handleListItemClick("welcome")}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Create an Account and Walkthru" />
          </ListItemButton>         
        </ListItem>
        <ListItem disableGutters key="welcomeExit">
          <ListItemButton onClick={() => {
                setWelcome(false);
                setIsDisabledUser(true);
                setDisableMsg("User is not Authorized for Access.");
          }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <CloseIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Exit" />
          </ListItemButton>         
        </ListItem>
      </List>
    </Dialog>
    {isDisabledUser && <DisableMode userId={props.userId} onSubmitChange={handleOnCancel} message={disableMsg} /> }
    {!isDisabledUser && mode == 2 && <PopupWelcome userId={props.userId} companyName={props.companyName} onClose={handleWelcomeClose} onDone={handleOnDone} />}
    {!isDisabledUser && mode == 0 && <AdminMode userId={props.userId} googleAPI={googleAPIKey} onSubmitChange={handleOnCancel} 
	          companyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin} adminLength={admin.length} />}
    {!isDisabledUser && mode == 1 && <UserMode userId={props.userId} what3words={what3WordsAPIKey} onSubmitChange={handleOnCancel} />}        
    </>
  );
}
