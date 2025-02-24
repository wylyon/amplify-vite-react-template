
// @ts-nocheck
import { useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Alert from '@mui/material/Alert';

export default function InputCustCompany(props) {
  const [formData, setFormData] = useState({
    id: props.company.id,
    name: props.company.name,
    email: props.company.email,
    address1: props.company.address1,
    address2: props.company.address2,
    city: props.company.city,
    state: props.company.state,
    zipcode: props.company.zipcode,
    ref_department: props.company.ref_department,
    notes: props.company.notes,
  });

  const client = generateClient<Schema>();
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertError, setIsAlertError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const verifyCompany = async() => {
    const { errors, data: items} = await client.queries.listAllDivisionsByCompanyId({
      companyId: props.company.id
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    if (items && items.length > 0) {
      setAlertMessage("Divisions exist.   Please DELETE all Divisions before deleting Company.");
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    // here we can delete the company and admin rows

  }

  const updateCompany = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    const { data: updateData, errors } = await client.models.company.update({ 
      id: props.company.id,
      name: formData.name, 
      email: formData.email,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      ref_department: formData.ref_department,
      notes: formData.notes,
      created: now,
      created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    setAlertMessage("Company record updated!");
    setIsAlertError(false);
    setIsAlert(true);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    (props.isAddMode || isGoAdd) ? createCompany() : updateCompany();
    props.onSubmitChange(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleOnDelete = (e) => {
    props.onSubmitChange(false);
  }

  return (
    <div>
     <h1 align="center">Company Maintenance</h1>
      <form onSubmit={handleSubmit}>
      <label>
        Name: </label>
        <input
          type="text"
	  name="name"
	  placeholder="Company Name"
	  size="40"
          value={formData.name}
          onChange={handleChange} />
      <label>  Email:  </label>
        <input
          type="text"
	  name="email"
	  placeholder="Finance/Billing Email Address"
	  size="40"
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
      <label>
        Address:</label><br />
        <input
          type="text"
	  name="address1"
	  placeholder="Physical mailing address"
	  size="45"
          value={formData.address1}
          onChange={handleChange}
        /><br />
        <input
          type="text"
	  name="address2"
	  placeholder="Additional address"
	  size="45"
          value={formData.address2}
          onChange={handleChange}
        /><br /><br />
	<label>City: </label>
        <input
          type="text"
	  name="city"
	  placeholder="City"
	  size="20"
          value={formData.city}
          onChange={handleChange}
        />
	<label>State: </label>
        <input
          type="text"
	  name="state"
	  placeholder="ST"
	  size="2"
          value={formData.state}
          onChange={handleChange}
        />
	<label>Zip: </label>
        <input
          type="text"
	  name="zipcode"
	  placeholder="Zipcode"
	  size="10"
          value={formData.zipcode}
          onChange={handleChange}
        /><br /><br />
	<label>Dept: </label>
        <input
          type="text"
	  name="ref_department"
	  placeholder="Reference Department"
	  size="40"
          value={formData.ref_department}
          onChange={handleChange}
        />
      <label>. Notes: </label>
	<input type="text" 
	 name="notes" 
	 placeholder="Notes for this entry" 
	 size="80"
	 value={formData.notes} 
	 onChange={handleChange} 
	/>
	<div className="button-container">
  	<button type="submit" style={{ margin: '8px 0', padding: '5px' }}>Update</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
    <button className="cancelButton" onClick={verifyCompany}>Delete</button>
	</div>
      </form>
      {isAlert && <Alert severity={isAlertError ? "error" : "success"} onClose={() => {setIsAlert(false)}} >{alertMessage}</Alert>}
     </div>
  );
}