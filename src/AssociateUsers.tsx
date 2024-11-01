// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
import React from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import Button from "@mui/material/Button";
import DisplayQuestion from "../src/DisplayQuestion";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Typography from "@mui/material/Typography";

export default function AssociateUsers(props) {

  const [userData, setUserData] = useState([{
    id: '',   
    firstName: '',
    lastName: '',
    templateUserId: props.id,
    enabledDate: '',
    verifiedDate: '',
    emailAddress: '',
  }]);
  const [open, setOpen] = useState(true);
  const [userDataArr, setUserDataArr] = useState([]);
  const client = generateClient<Schema>();
  const [filtered, setFiltered] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState<Schema["template_permissions"]["type"][]>([]);

  function translateUserPermission (item) {
    const data = [{id: item.id, firstName: item.first_name, lastName: item.last_name, templateUserId: item.template_user_id,
      enabledDate: item.enabled_date, verifiedDate: item.verified_date, emailAddress: item.email_address}];
    return data;
  }

  function translateUserPermissions (items) {
    var item = JSON.parse(items[0]);
    var data = [{id: item.id, 
      firstName: item.first_name, 
      lastName: item.last_name, 
      templateUserId: item.template_user_id,
      enabledDate: item.enabled_date, 
      verifiedDate: item.verified_date, 
      emailAddress: item.email_address}];
    for (var i=1; i < items.length; i++) {
      const item = JSON.parse(items[i]);
      data.push(
        {id: item.id, 
          firstName: item.first_name, 
          lastName: item.last_name, 
          templateUserId: item.template_user_id,
          enabledDate: item.enabled_date, 
          verifiedDate: item.verified_date, 
          emailAddress: item.email_address}
      );
    }
    return data;
  }

  const getPermissionsByDivisionTemplate = async (divId, tempId) => {
    const { data: items, errors } = await client.queries.listUserTemplatePermissions({
      divisionId: divId,
      templateId: tempId,
    })
    if (Array.isArray(items) && items.length > 0) {
      const db = JSON.stringify(items);
      const userItems = JSON.parse(db);
      if (items.length < 2) {
        setUserData(translateUserPermission (userItems));
      } else {
        setUserData(translateUserPermissions (userItems));
      }
    }
  };

  useEffect(() => {
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }, []);

  const handleOnCancel = (e) => {
    setOpen(false);
    props.onSubmitChange(false);
  };

  const handleOnDelete = async(id, activeDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!activeDate);

   const { errors, data: updatedTemplatePermission} = await client.models.template_permissions.update({ 
	    id: id,
	    enabled_date: (isNull) ? now : null});
    if (errors) {
      alert(errors[0].message);
    }
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }

  const handleAddUser = async(userId, templateUserId) => {
    const now = new Date();
    const uuid = uuidv4();
    if (!templateUserId) {
      const { errors, data: newTemplatePermission } = await client.models.template_permissions.create({ 
	      id: uuid,
	      template_id: props.id,
        user_id: userId,
        enabled_date: now,
	      created: now,
	      created_by: 0});
      if (errors) {
        alert(errors[0].message);
      }
    } else {
      const { errors, data: deletedTemplatePermission } = await client.models.template_permissions.delete({
        id: templateUserId
      });
      if (errors) {
        alert(errors[0].message);
      }
    }
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }

  const filter = userData.filter(comp => comp.id != '');

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
        open={open}
        fullWidth
        maxWidth='lg'
        onClose={handleOnCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.name} Template Users
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
    <div>
      <table>
	    <thead>
	      <tr>
	        <th>Id</th>
	        <th>Name</th>
	        <th>In/Out</th>
	        <th>Enabled</th>
          <th>Verified</th>
	      </tr>
	    </thead>
	    <tbody>
	      {filter.map(comp => <tr key={comp.id}>
	        <td>{comp.emailAddress}</td>
	        <td>{comp.firstName + " " + comp.lastName}</td>
	        <td ><button className={(!comp.templateUserId) ? "activateButton" : "cancelButton"}
		        onClick={() => handleAddUser(comp.id, comp.templateUserId)}>{(!comp.templateUserId) ? "Add To Template" : 
            "Delete From Template"}</button></td>
          {!comp.templateUserId ? <td>{comp.enabledDate}</td> : 
            <td><button className={(!comp.enabledDate) ? "activateButton" : "cancelButton"}
            onClick={() => handleOnDelete(comp.templateUserId, comp.enabledDate)}>{(!comp.enabledDate) ? "Activate" : "DeActivate"}</button></td>}
          <td>{comp.verifiedDate}</td>
	      </tr>)}
	    </tbody>
	  </table>
    </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnCancel} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}