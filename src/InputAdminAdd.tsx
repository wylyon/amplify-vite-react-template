// @ts-nocheck
import { useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
import SelectCustomer from '../src/SelectCustomer';
export default function InputAdminAdd(props) {
  const [formData, setFormData] = useState({
    id: props.updateFormData.id,  
    email: props.updateFormData.email,
    companyId: props.updateFormData.companyId,
    companyName: props.updateFormData.companyName,
    firstName: props.updateFormData.firstName,
    lastName: props.updateFormData.lastName,
    middleName: props.updateFormData.middleName,
    activeDate: props.updateFormData.activeDate,
  });

  const client = generateClient<Schema>();
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(props.updateFormData.companyName);
  const [selectedCompanyId, setSelectedCompanyId] = useState(props.updateFormData.companyId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const createAdmin = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    await client.models.admin.create({ 
	id: uuidv4(),
	email_address: formData.email,
	company_id: selectedCompanyId,
 	company_name: selectedCompany,
	first_name: formData.firstName,
	last_name: formData.lastName,
	middle_name: formData.middleName,
	active_date: formData.activeDate = '' ? now : formData.activeDate,
	created: now,
	created_by: 0});
  }

  const updateAdmin = async() => {
    const now = new Date();
    await client.models.admin.update({ 
	id: props.updateFormData.id,
	email_address: formData.email,
	company_id: selectedCompanyId,
	company_name: selectedCompany,
	first_name: formData.firstName,
	last_name: formData.lastName,
	middle_name: formData.middleName,
	active_date: formData.activeDate = '' ? now : formData.activeDate});
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

  const handleSubmit = (e) => {
    e.preventDefault();
    (props.isAddMode || isGoAdd) ? createAdmin() : updateAdmin();
    props.onSubmitChange(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  function resetForm() {
    setIsNew((isNew) => ! isNew);
    setIsGoAdd((isGoAdd) => ! isGoAdd);
  }

  return (
    <div className="addCustomerData">
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
        <SelectCustomer props={props} selected={selectedCompany} onSelectCompany={handleSelectChange} />
        <br /><label>Company {selectedCompany}</label><br />
	      <label>Name: </label>
        <input
          type="text"
	        name="firstName"
          required
	        placeholder="First"
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
	<div class="button-container">
  	  <button type="submit" style={{ margin: '8px 0', padding: '5px' }}>{props.isAddMode || isGoAdd ? "Add" : "Update"}</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </form>
     </div>
  );
}