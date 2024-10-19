// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
import SelectCustomer from '../src/SelectCustomer';
import SignUp from '../src/SignUp';
import Alert from '@mui/material/Alert';

export default function InputAdminAdd(props) {
  const [formData, setFormData] = useState({
    id: props.updateFormData.id,  
    email: props.updateFormData.email,
    companyId: props.updateFormData.companyId,
    divisionId: props.updateFormData.divisionId,
    firstName: props.updateFormData.firstName,
    lastName: props.updateFormData.lastName,
    middleName: props.updateFormData.middleName,
    activeDate: props.updateFormData.activeDate,
    notes: props.updateFormData.notes,
  });

  const client = generateClient<Schema>();
  const [user, setUser] = useState<Schema["user"]["type"][]>([]);
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(props.updateFormData.companyName);
  const [selectedCompanyId, setSelectedCompanyId] = useState(props.updateFormData.companyId);
  const [isSignUpTime, setIsSignUpTime] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const loadAdminUsers = async() => {
    const { errors, data: items } = await client.models.admin.list();
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);     
    } else {
      setAdmin(items);
    }
  }

  function doesUserExist (emailAddress) {
    const filtered = user.filter(comp => comp.email_address.includes(emailAddress) );
    if (filtered == null || filtered.length < 1) {
      return true;
    }
    setAlertMessage(emailAddress + " Already Exists.");
    setIsAlert(true);
    return false;
  }

  const createUser = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    const { errors, data: newUser } = await client.models.user.create({ 
      id: uuidv4(),
      email_address: formData.email,
      division_id: formData.divisionId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      middle_name: formData.middleName,
      active_date: formData.activeDate = '' ? now : formData.activeDate,
      notes: formData.notes,
      created: now,
      created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
    }
  }

  const updateUser = async() => {
    const now = new Date();
    const { errors, data: updatedUser } = await client.models.user.update({ 
      id: props.updateFormData.id,
      email_address: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      middle_name: formData.middleName,
      active_date: formData.activeDate = '' ? now : formData.activeDate,
      notes: formData.notes});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
    }
  }

  const handleSelectChange = (e) => {
    const companyName = e.split("|")[0];
    if (companyName != 'All') {
      setSelectedCompany(companyName);
      setSelectedCompanyId(e.split("|")[1]);
      return;
    }
    setSelectedCompany('');
    setSelectedCompanyId('');
  };


  const handleSignOnCancel = (e) => {
     setIsSignUpTime(false);
     props.onSubmitChange(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.isAddMode || isGoAdd) {
      if (doesUserExist (formData.email)) {
        createUser();
        setSignUpEmail(e.target.email.value);
        setIsSignUpTime(true);
        return true;
      }
      return false;
    } else {
      updateUser();
      props.onSubmitChange(false);
    }
    return true;
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  useEffect(() => {
    loadAdminUsers();
    const sub = client.models.user.observeQuery().subscribe({
      next: (data) => setUser([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
  }

  return (
    <div className="addCustomerData">
      {isAlert &&  <Alert severity="error" onClose={handleOnAlert}>
      {alertMessage}
      </Alert>}
      <form onSubmit={handleSubmit}>
      <label>  Email:  </label>
        <input
          type="text"
	        name="email"
          required
	        placeholder="Login Email Address"
	        size="40"
          value={isNew ? '' : formData.email}
          onChange={handleChange}
        /><br />
        <br />
	    <label>Name: </label>
        <input
          type="text"
	         name="firstName"
	        placeholder="First"
          required
	       size="20"
          value={isNew ? '' : formData.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
	        name="middleName"
	        placeholder="Middle"
	        size="20"
          value={isNew ? '' : formData.middleName}
          onChange={handleChange}
        />
        <input
          type="text"
	        name="lastName"
          required
	        placeholder="Last"
	        size="20"
          value={isNew ? '' : formData.lastName}
          onChange={handleChange}
        /><br />
	    <label>Active: </label>
        <input
          type="date"
	        name="activeDate"
	        placeholder="Active Date"
	        size="20"
          value={isNew ? '' : formData.activeDate}
          onChange={handleChange}
        />
	      <br />
	      <label>Notes: </label>
	        <input type="text"
	          name="notes"
	           placeholder="Notes for this User"
	          size="100"
	          value={isNew ? '' : formData.notes}
	          onChange={handleChange}
	      />
	<div className="button-container">
  	  <button type="submit" style={{ margin: '8px 0', padding: '5px' }}>{props.isAddMode || isGoAdd ? "Add" : "Update"}</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </form>
{isSignUpTime && <SignUp email={signUpEmail} onSubmitChange={handleSignOnCancel} /> }
     </div>
  );
}