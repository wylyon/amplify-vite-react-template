
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
export default function InputCustCompany(props) {
  const [formData, setFormData] = useState({
    id: props.updateFormData.id,
    name: props.updateFormData.name,
    email: props.updateFormData.email,
    address1: props.updateFormData.address1,
    address2: props.updateFormData.address2,
    city: props.updateFormData.city,
    state: props.updateFormData.state,
    zipcode: props.updateFormData.zipcode,
    ref_department: props.updateFormData.ref_department,
    notes: props.updateFormData.notes,
  });

  const client = generateClient<Schema>();
  const [company, setCompany] = useState<Schema["company"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);

  useEffect(() => {
    const sub = client.models.company.observeQuery().subscribe({
      next: (data) => setCompany([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const updateCompany = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    await client.models.company.update({ 
	id: props.updateFormData.id,
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
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    (props.isAddMode || isGoAdd) ? createCompany() : updateCompany();
    props.onSubmitChange(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  return (
    <div className="addCustomerData2">
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
        /><br />
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
        /><br />
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
        /><br />
	<label>Dept: </label>
        <input
          type="text"
	  name="department"
	  placeholder="Reference Department"
	  size="40"
          value={formData.refdepartment}
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
	<div class="button-container">
  	  <button type="submit" style={{ margin: '8px 0', padding: '5px' }}>Update</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </form>
     </div>
  );
}