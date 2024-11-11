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
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';

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
  const [open, setOpen] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const [googleAPIKey, setGoogleAPIKey] = useState('');
  const [what3WordsAPIKey, setWhat3WordsAPIKey] = useState('');

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
        setIsValidUser(false);
        return false;
      }
      setIsValidUser(true);
      return true;
    }
  }
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
      const what3wordsAPI = items.filter(map => map.code.includes('WHAT3WORDS_API_KEY'));
      setWhat3WordsAPIKey(what3wordsAPI[0].value);
    }
  }
  const fetchAdmins = (emailId, items) => {
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
      setDisableMsg("User is not Authorized for Access.");
      setIsDisabledUser(true);
      return true
    }
    if (!filterAdmin[0].company_id) {
      setIsSuperAdmin(true);
    }
    if (getUser(emailId)) {
      // here we have an Admin who is also a template user
      // check screen size...if mobile then default to company user vs admin.
      if (isMobile()) {
        setMode(1);
        setIsSuperAdmin(false);
        return false;
      }
      setOpen(true);
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
    getAppSettings();
    setUserEmail(props.userId);
    allAdmins();
  }, []);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleSuperClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (value: string) => {
    setOpen(false);
    if (value == "admin") {
      setMode(0);
    } else {
      setMode(1);
      setIsSuperAdmin(false);
    }
  };

  const filtered = admin.filter(comp => comp.email_address.includes(userEmail));

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
            <ListItemText primary="Regular" />
          </ListItemButton>         
        </ListItem>
      </List>
    </Dialog>
    {isDisabledUser && <DisableMode userId={props.userId} onSubmitChange={handleOnCancel} message={disableMsg} /> }
    {!isDisabledUser && mode == 0 && <AdminMode userId={props.userId} googleAPI={googleAPIKey} onSubmitChange={handleOnCancel} 
	          companyId={filtered.length> 0 ? filtered[0].company_id : null} isSuperAdmin={isSuperAdmin} adminLength={admin.length} />}
    {!isDisabledUser && mode == 1 && <UserMode userId={props.userId} what3words={what3WordsAPIKey} onSubmitChange={handleOnCancel} />}        
    </>
  );
}
